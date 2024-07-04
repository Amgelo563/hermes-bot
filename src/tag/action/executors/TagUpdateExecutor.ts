import { IllegalStateError } from '@nyx-discord/core';
import { nanoid } from 'nanoid';
import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagData } from '../../data/TagData';

import type { TagRepository } from '../../database/TagRepository';
import type { DiscordTagAgent } from '../../discord/DiscordTagAgent';
import type { TagMessagesParser } from '../../message/TagMessagesParser';
import type { TagModalCodec } from '../../modal/TagModalCodec';
import type { TagActionExecutor } from './TagActionExecutor';

export class TagUpdateExecutor implements TagActionExecutor {
  protected readonly modalCodec: TagModalCodec;

  protected readonly messages: TagMessagesParser;

  protected readonly repository: TagRepository;

  protected readonly configWrapper: HermesConfigWrapper;

  constructor(
    messages: TagMessagesParser,
    modalCodec: TagModalCodec,
    repository: TagRepository,
    configWrapper: HermesConfigWrapper,
  ) {
    this.modalCodec = modalCodec;
    this.messages = messages;
    this.repository = repository;
    this.configWrapper = configWrapper;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordTagAgent,
    tag: TagData,
  ): Promise<void> {
    if (!interaction.isModalSubmit()) {
      throw new TypeError();
    }

    await deferReplyOrUpdate(interaction);
    const member = await agent.fetchMemberFromInteraction(interaction);

    const context = {
      member,
      services: { tag },
    };

    if (!this.configWrapper.canEditTags(member)) {
      const error = this.messages.getNotAllowedErrorEmbed(context);

      await interaction.editReply({ embeds: [error] });
      return;
    }

    const newData = this.modalCodec.extractFromModal(interaction);

    const oldTag = await this.repository.find(tag.id);
    if (!oldTag) {
      throw new IllegalStateError();
    }
    const newTag = {
      ...oldTag,
      ...newData,
    };

    try {
      await this.repository.update(tag.id, newData);
      await agent.postUpdateLog(member, oldTag, newTag);
    } catch (e) {
      const errorId = nanoid(5);

      const errors = this.messages.getUpdateErrorEmbeds({
        ...context,
        error: {
          instance: e as Error,
          id: errorId,
        },
      });

      await interaction.editReply({
        embeds: [errors.user],
        components: [],
      });

      await agent.postError(errors.log);
    }

    const newEmbed = this.messages.getInfoEmbed(context);
    const success = this.messages.getUpdateSuccessEmbed(context);

    if (interaction.isFromMessage()) {
      await interaction.editReply({ embeds: [newEmbed] });

      await interaction.followUp({
        embeds: [success],
        ephemeral: true,
      });
    } else {
      await interaction.editReply({
        embeds: [newEmbed, success],
        components: [],
      });
    }
  }
}
