import type { NyxBot } from '@nyx-discord/core';
import type { ButtonInteraction } from 'discord.js';
import { nanoid } from 'nanoid';
import { ConfirmationSession } from '../../../bot/sessions/ConfirmationSession';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';

import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { WithRequired } from '../../../types/WithRequired';
import type { BlacklistCreateData } from '../../data/BlacklistCreateData';
import type { BlacklistData } from '../../data/BlacklistData';
import type { DiscordBlacklistAgent } from '../../discord/DiscordBlacklistAgent';
import type { BlacklistPlaceholderContext } from '../../message/placeholder/BlacklistPlaceholderContext';
import type { BlacklistMessagesParser } from '../../message/read/BlacklistMessagesParser';
import type { BlacklistRepository } from '../../repository/BlacklistRepository';

export class BlacklistCreateExecutor
  implements ServiceActionExecutor<DiscordBlacklistAgent, BlacklistCreateData>
{
  protected readonly bot: NyxBot;

  protected readonly blacklistMessages: BlacklistMessagesParser;

  protected readonly messages: HermesMessageService;

  protected readonly repository: BlacklistRepository;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    repository: BlacklistRepository,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.blacklistMessages = messages.getBlacklistMessages();
    this.repository = repository;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordBlacklistAgent,
    createData: BlacklistCreateData,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const data: BlacklistData = {
      id: createData.blacklisted.id,
      reason: createData.reason,
      createdBy: createData.blacklister.id,
      expiresAt: createData.expiresAt,
      createdAt: new Date(),
    };

    const invoker = await agent.fetchMemberFromInteraction(interaction);
    const context: BlacklistPlaceholderContext = {
      member: invoker,
      blacklist: {
        ...data,
        blacklisted: createData.blacklisted,
        blacklister: createData.blacklister,
      },
    };

    const blacklisted = createData.blacklisted;
    const existing = await this.checkExisting(
      blacklisted,
      invoker,
      interaction,
    );
    if (existing) return;

    const buttonInteraction = await this.askConfirmation(context, interaction);
    if (!buttonInteraction) return;

    try {
      await this.repository.create(data);
    } catch (e) {
      const error = e as Error;

      const errorContext: WithRequired<BlacklistPlaceholderContext, 'error'> = {
        ...context,
        error: {
          instance: error,
          id: nanoid(5),
        },
      };

      const errors = this.blacklistMessages.getCreateErrorEmbeds(errorContext);

      await buttonInteraction.editReply({ embeds: [errors.user] });
      await agent.postError(errors.log);

      return;
    }

    await agent.logBlacklistCreate(invoker, blacklisted, data);

    const successEmbed = this.blacklistMessages.getCreateSuccessEmbed(context);
    await buttonInteraction.editReply({ embeds: [successEmbed] });
  }

  protected async askConfirmation(
    context: BlacklistPlaceholderContext,
    interaction: ServiceActionInteraction,
  ): Promise<ButtonInteraction | null> {
    const confirmEmbed = this.blacklistMessages.getCreateConfirmEmbed(context);
    const infoEmbed = this.blacklistMessages.getInfoEmbed(context);
    const confirm = new ConfirmationSession(
      this.bot,
      interaction,
      this.messages,
      [confirmEmbed, infoEmbed],
      false,
      context,
    );

    await this.bot.getSessionManager().start(confirm);
    const resultData = await confirm.getEndPromise();
    const confirmData = resultData.result;
    if (!confirmData?.confirmed) return null;

    const buttonInteraction = confirmData.button;
    await buttonInteraction.update({ components: [] });

    return buttonInteraction;
  }

  protected async checkExisting(
    blacklisted: HermesMember,
    blacklister: HermesMember,
    interaction: ServiceActionInteraction,
  ): Promise<boolean> {
    const blacklist = await this.repository.find(blacklisted.id);
    if (!blacklist) return false;

    const context: BlacklistPlaceholderContext = {
      member: blacklister,
      blacklist: {
        ...blacklist,
        blacklister,
        blacklisted,
      },
    };

    const error = this.blacklistMessages.getAlreadyBlacklistedEmbed(context);
    const info = this.blacklistMessages.getInfoEmbed(context);
    await interaction.editReply({ embeds: [error, info] });
    return true;
  }
}
