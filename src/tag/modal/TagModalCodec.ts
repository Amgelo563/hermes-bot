import { TextInputBuilder } from '@discordjs/builders';
import { TextInputStyle } from 'discord-api-types/v10';
import type { ModalBuilder, ModalSubmitInteraction } from 'discord.js';
import { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';
import type { DiscordModalCodec } from '../../discord/modal/codec/DiscordModalCodec';
import type { TagCreateData } from '../../service/tag/TagCreateData';
import type { TagModalData } from './TagModalData';

export class TagModalCodec implements DiscordModalCodec<TagCreateData> {
  protected static readonly ModalFieldsIds: Record<
    Capitalize<keyof TagModalData['fields']>,
    string
  > = {
    Name: 'name',
    Description: 'description',
    Color: 'color',
  };

  protected readonly modalData: TagModalData;

  protected cachedModal: ModalBuilder | null = null;

  constructor(modalData: TagModalData) {
    this.modalData = modalData;
  }

  public extractFromModal(interaction: ModalSubmitInteraction): TagCreateData {
    const ids = TagModalCodec.ModalFieldsIds;
    const get = interaction.fields.getTextInputValue.bind(interaction.fields);

    const name = get(ids.Name);
    const description = get(ids.Description);
    const color = get(ids.Color);

    return {
      name,
      description,
      color,
    };
  }

  public createModal(): ModalBuilder {
    if (this.cachedModal) {
      return this.cachedModal;
    }

    const { fields, modal } = this.modalData;

    fields.name
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(35)
      .setMinLength(1)
      .setCustomId(TagModalCodec.ModalFieldsIds.Name);

    fields.description
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100)
      .setMinLength(1)
      .setCustomId(TagModalCodec.ModalFieldsIds.Description);

    fields.color
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(7)
      .setMinLength(7)
      .setValue('#000000')
      .setCustomId(TagModalCodec.ModalFieldsIds.Color);

    modal.setTextInputs(...Object.values(fields));

    return modal;
  }

  public createFromData(data: TagCreateData, customId: string): ModalBuilder {
    const modal = new SimplifiedModalBuilder(
      this.createModal().setCustomId(customId).toJSON(),
    );
    const { fields } = this.modalData;

    const nameField = new TextInputBuilder(fields.name.toJSON());
    const descriptionField = new TextInputBuilder(fields.description.toJSON());
    const colorField = new TextInputBuilder(fields.color.toJSON());

    nameField.setValue(data.name);
    descriptionField.setValue(data.description);
    colorField.setValue(data.color);

    return modal.setTextInputs(...Object.values(fields));
  }

  public equals(
    data: TagCreateData,
    interaction: ModalSubmitInteraction,
  ): boolean {
    const ids = TagModalCodec.ModalFieldsIds;
    const get = interaction.fields.getTextInputValue.bind(interaction.fields);

    return (
      data.name === get(ids.Name)
      && data.description === get(ids.Description)
      && data.color === get(ids.Color)
    );
  }
}
