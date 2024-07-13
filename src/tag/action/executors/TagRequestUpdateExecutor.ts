import { IllegalStateError } from '@nyx-discord/core';
import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagData } from '../../data/TagData';
import type { DiscordTagAgent } from '../../discord/DiscordTagAgent';

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
    agent: DiscordTagAgent,
    tag: TagData,
  ): Promise<void> {
    if (interaction.isModalSubmit()) return;

    // Technically sync, since the interaction will always come from a modal in a guild
    const member = await agent.fetchMemberFromInteraction(interaction);
    if (!member || !this.configWrapper.canEditTags(member)) {
      throw new IllegalStateError();
    }

    const modalId = this.actionsCodec.createActionCustomId(
      tag.id,
      TagAction.enum.Update,
    );

    const modal = this.modalCodec.createModal(modalId, tag);
    await interaction.showModal(modal);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async defer(_interaction: ServiceActionInteraction): Promise<void> {
    return;
  }
}
