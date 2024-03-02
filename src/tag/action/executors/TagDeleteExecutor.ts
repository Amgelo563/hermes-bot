import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import { IllegalStateError } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import { ConfirmationSession } from '../../../bot/sessions/ConfirmationSession';
import type { TagRepository } from '../../../hermes/database/TagRepository';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagData } from '../../../service/tag/TagData';
import type { WithRequired } from '../../../types/WithRequired';
import type { DiscordTagAgent } from '../../discord/DiscordTagAgent';
import type { TagActionExecutor } from './TagActionExecutor';

export class TagDeleteExecutor implements TagActionExecutor {
  protected readonly bot: NyxBot;

  protected readonly messages: HermesMessageService;

  protected readonly repository: TagRepository;

  protected readonly agent: DiscordTagAgent;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    repository: TagRepository,
    agent: DiscordTagAgent,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.repository = repository;
    this.agent = agent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    tag: TagData,
  ): Promise<void> {
    if (!interaction.member) {
      throw new IllegalStateError();
    }

    const context = {
      user: interaction.user,
      services: { tag },
    };

    const tags = this.repository.getTags();
    const tagMessages = this.messages.getTagsMessages();

    if (tags.length === 1) {
      const error = tagMessages.getDeleteProtectedErrorEmbed(context);

      if (interaction.replied) {
        await interaction.editReply({ embeds: [error] });
      } else {
        await interaction.reply({ embeds: [error] });
      }

      return;
    }

    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const confirmEmbed = tagMessages.getDeleteConfirmEmbed(context);
    const infoEmbed = tagMessages.getInfoEmbed(context);

    const confirm = new ConfirmationSession(
      this.bot,
      interaction as SessionStartInteraction,
      this.messages,
      [infoEmbed, confirmEmbed],
      true,
      context,
    );

    await this.bot.sessions.start(confirm);

    const resultData = await confirm.getEndPromise();
    const confirmData = resultData.result;
    if (!confirmData?.confirmed) return;

    const buttonInteraction = confirmData.button;
    await buttonInteraction.update({ components: [] });

    try {
      await this.repository.delete(tag.id);
      await this.agent.postDeleteLog(context.user, tag);
    } catch (e) {
      const id = nanoid(5);
      const errorContext = {
        ...context,
        error: {
          instance: e as Error,
          id,
        },
      } satisfies WithRequired<HermesPlaceholderContext, 'error'>;
      const error = tagMessages.getDeleteErrorEmbeds(errorContext);

      await buttonInteraction.editReply({ embeds: [error.user] });
      await this.agent.postError(error.log);

      return;
    }

    const embed = tagMessages.getDeleteSuccessEmbed(context);
    await buttonInteraction.editReply({
      embeds: [embed],
      components: [],
    });
  }
}
