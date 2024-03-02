import { IllegalStateError } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import type { TagRepository } from '../../../hermes/database/TagRepository';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagData } from '../../../service/tag/TagData';
import type { DiscordTagAgent } from '../../discord/DiscordTagAgent';
import type { TagMessagesParser } from '../../message/TagMessagesParser';
import type { TagModalCodec } from '../../modal/TagModalCodec';
import type { TagActionExecutor } from './TagActionExecutor';

export class TagUpdateExecutor implements TagActionExecutor {
  protected readonly modalCodec: TagModalCodec;

  protected readonly messages: TagMessagesParser;

  protected readonly repository: TagRepository;

  protected readonly agent: DiscordTagAgent;

  constructor(
    messages: TagMessagesParser,
    modalCodec: TagModalCodec,
    repository: TagRepository,
    agent: DiscordTagAgent,
  ) {
    this.modalCodec = modalCodec;
    this.messages = messages;
    this.repository = repository;
    this.agent = agent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    tag: TagData,
  ): Promise<void> {
    if (!interaction.isModalSubmit()) {
      throw new TypeError();
    }

    const context = {
      user: interaction.user,
      services: { tag },
    };
    const newData = this.modalCodec.extractFromModal(interaction);

    if (interaction.isFromMessage()) {
      await interaction.deferUpdate();
    } else {
      await interaction.deferReply({ ephemeral: true });
    }

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
      await this.agent.postUpdateLog(context.user, oldTag, newTag);
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

      await this.agent.postError(errors.log);
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
