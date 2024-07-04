import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import { ConfirmationSession } from '../../../bot/sessions/ConfirmationSession';
import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { WithRequired } from '../../../types/WithRequired';
import type { TagData } from '../../data/TagData';
import type { TagRepository } from '../../database/TagRepository';
import type { DiscordTagAgent } from '../../discord/DiscordTagAgent';
import type { TagActionExecutor } from './TagActionExecutor';

export class TagDeleteExecutor implements TagActionExecutor {
  protected readonly bot: NyxBot;

  protected readonly messages: HermesMessageService;

  protected readonly repository: TagRepository;

  protected readonly configWrapper: HermesConfigWrapper;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    repository: TagRepository,
    configWrapper: HermesConfigWrapper,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.repository = repository;
    this.configWrapper = configWrapper;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordTagAgent,
    tag: TagData,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
      services: { tag },
    };

    const tagMessages = this.messages.getTagsMessages();

    if (!member || !this.configWrapper.canEditTags(member)) {
      const error = tagMessages.getNotAllowedErrorEmbed(context);

      await interaction.editReply({ embeds: [error] });
      return;
    }

    const tags = this.repository.getTags();

    if (tags.length === 1) {
      const error = tagMessages.getDeleteProtectedErrorEmbed(context);

      await interaction.editReply({ embeds: [error] });
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
      await agent.postDeleteLog(member, tag);
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
      await agent.postError(error.log);

      return;
    }

    const embed = tagMessages.getDeleteSuccessEmbed(context);
    await buttonInteraction.editReply({
      embeds: [embed],
      components: [],
    });
  }
}
