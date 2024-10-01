import { IllegalStateError } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesErrorAgent } from '../../../error/HermesErrorAgent';
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

  protected readonly errorAgent: HermesErrorAgent;

  constructor(
    messages: TagMessagesParser,
    modalCodec: TagModalCodec,
    repository: TagRepository,
    configWrapper: HermesConfigWrapper,
    errorAgent: HermesErrorAgent,
  ) {
    this.modalCodec = modalCodec;
    this.messages = messages;
    this.repository = repository;
    this.configWrapper = configWrapper;
    this.errorAgent = errorAgent;
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

      await this.errorAgent.consumeWithErrorEmbeds(e, errors, interaction);
      return;
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
