import type { ModalBuilder, ModalSubmitInteraction } from 'discord.js';
import {
  type APIModalInteractionResponseCallbackData,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';
import type { DiscordModalCodec } from '../../discord/modal/codec/DiscordModalCodec';
import type { TagCreateData } from '../data/TagCreateData';
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

  protected cachedModalData: APIModalInteractionResponseCallbackData | null =
    null;

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

  public createModal(
    customId: string,
    presentData?: TagCreateData,
  ): ModalBuilder {
    const data = this.modalData;

    if (this.cachedModalData) {
      const newData = structuredClone(this.cachedModalData);
      newData.custom_id = customId;

      const builder = new SimplifiedModalBuilder(newData);
      if (!presentData) return builder;

      return this.populateWithData(presentData, builder);
    }

    const { fields, modal } = data;

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

  protected populateWithData(
    data: TagCreateData,
    modal: SimplifiedModalBuilder,
  ): ModalBuilder {
    const { fields } = this.modalData;

    const nameField = new TextInputBuilder(fields.name.toJSON());
    const descriptionField = new TextInputBuilder(fields.description.toJSON());
    const colorField = new TextInputBuilder(fields.color.toJSON());

    nameField.setValue(data.name);
    descriptionField.setValue(data.description);
    colorField.setValue(data.color);

    return modal.setTextInputs(...Object.values(fields));
  }
}
