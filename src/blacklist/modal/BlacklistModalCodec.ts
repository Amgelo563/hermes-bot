import { ComponentType, TextInputStyle } from 'discord-api-types/v10';
import type { ModalBuilder, ModalSubmitInteraction } from 'discord.js';
import { TextInputBuilder } from 'discord.js';
import { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';

import type { DiscordModalCodec } from '../../discord/modal/codec/DiscordModalCodec';
import type { ModalDataWithFields } from '../../discord/modal/schema/DiscordModalSchema';
import type { BlacklistModalData } from './BlacklistModalData';

export class BlacklistModalCodec
  implements DiscordModalCodec<BlacklistModalData>
{
  protected static readonly FieldIds: Record<
    Capitalize<keyof BlacklistModalData>,
    string
  > = {
    Time: 'time',
    Reason: 'reason',
  };

  protected readonly messageModal: ModalDataWithFields<
    keyof BlacklistModalData
  >;

  protected cachedMessageModal: SimplifiedModalBuilder | null = null;

  constructor(messageModal: ModalDataWithFields<keyof BlacklistModalData>) {
    this.messageModal = messageModal;
  }

  public createModal(
    customId: string,
    presentData?: BlacklistModalData,
  ): ModalBuilder {
    if (!this.cachedMessageModal) {
      const cachedModal = this.messageModal;

      const timeField = new TextInputBuilder({
        ...cachedModal.fields.time,
        custom_id: BlacklistModalCodec.FieldIds.Time,
        style: TextInputStyle.Short,
        type: ComponentType.TextInput,
        required: false,
      });

      const reasonField = new TextInputBuilder({
        ...cachedModal.fields.reason,
        custom_id: BlacklistModalCodec.FieldIds.Reason,
        style: TextInputStyle.Short,
        type: ComponentType.TextInput,
        required: true,
      });

      this.cachedMessageModal = new SimplifiedModalBuilder({
        ...cachedModal,
        custom_id: 'mock',
      }).setTextInputs(reasonField, timeField);
    }

    const newModal = this.cachedMessageModal.clone().setCustomId(customId);
    if (!presentData) return newModal;

    if (presentData.time) {
      newModal.setValueOf(BlacklistModalCodec.FieldIds.Time, presentData.time);
    }

    if (presentData.reason) {
      newModal.setValueOf(
        BlacklistModalCodec.FieldIds.Reason,
        presentData.reason,
      );
    }

    return newModal;
  }

  public equals(
    data: BlacklistModalData,
    interaction: ModalSubmitInteraction,
  ): boolean {
    const reason = interaction.fields.getTextInputValue(
      BlacklistModalCodec.FieldIds.Reason,
    );
    const time = interaction.fields.getTextInputValue(
      BlacklistModalCodec.FieldIds.Time,
    );

    return data.reason === reason && data.time === time;
  }

  public extractFromModal(
    interaction: ModalSubmitInteraction,
    presentData?: BlacklistModalData,
  ): BlacklistModalData {
    const reason = interaction.fields.getTextInputValue(
      BlacklistModalCodec.FieldIds.Reason,
    );
    const time = interaction.fields.getTextInputValue(
      BlacklistModalCodec.FieldIds.Time,
    );

    return {
      ...presentData,
      reason,
      time,
    };
  }
}
