import type { ModalBuilder, ModalSubmitInteraction } from 'discord.js';

import type { HermesMember } from '../../../service/member/HermesMember';

export interface DiscordModalCodec<Data> {
  extractFromModal(
    interaction: ModalSubmitInteraction,
    invoker: HermesMember,
    presentData?: Data,
  ): Data;

  createModal(customId: string, presentData?: Data): ModalBuilder;

  equals(data: Data, interaction: ModalSubmitInteraction): boolean;
}
