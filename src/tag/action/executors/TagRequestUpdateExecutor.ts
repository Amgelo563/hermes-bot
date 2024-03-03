import { IllegalStateError } from '@nyx-discord/core';
import type { GuildMember } from 'discord.js';
import type { HermesConfigWrapper } from '../../../config/HermesConfigWrapper';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagData } from '../../../service/tag/TagData';

import type { TagModalCodec } from '../../modal/TagModalCodec';
import type { TagActionsCustomIdCodec } from '../codec/TagActionsCustomIdCodec';
import { TagAction } from '../TagAction';
import type { TagActionExecutor } from './TagActionExecutor';

export class TagRequestUpdateExecutor implements TagActionExecutor {
  protected readonly modalCodec: TagModalCodec;

  protected readonly actionsCodec: TagActionsCustomIdCodec;

  protected readonly configWrapper: HermesConfigWrapper;

  constructor(
    actionsCodec: TagActionsCustomIdCodec,
    modalCodec: TagModalCodec,
    configWrapper: HermesConfigWrapper,
  ) {
    this.actionsCodec = actionsCodec;
    this.modalCodec = modalCodec;
    this.configWrapper = configWrapper;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    tag: TagData,
  ): Promise<void> {
    if (interaction.isModalSubmit()) return;
    const member = interaction.member as GuildMember | null;
    if (!member || !this.configWrapper.canEditTags(member)) {
      throw new IllegalStateError();
    }

    const modalId = this.actionsCodec.createActionCustomId(
      tag.id,
      TagAction.enum.Update,
    );

    const modal = this.modalCodec.createFromData(tag, modalId);
    await interaction.showModal(modal);
  }
}
