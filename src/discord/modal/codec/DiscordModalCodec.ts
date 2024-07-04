import type { ModalBuilder, ModalSubmitInteraction } from 'discord.js';

export interface DiscordModalCodec<Data> {
  extractFromModal(
    interaction: ModalSubmitInteraction,
    presentData?: Data,
  ): Data;

  createModal(customId: string, presentData?: Data): ModalBuilder;

  equals(data: Data, interaction: ModalSubmitInteraction): boolean;
}
