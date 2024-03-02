import type { APIModalInteractionResponseCallbackData } from 'discord-api-types/v10';
import { TextInputStyle } from 'discord-api-types/v10';
import type { ModalSubmitInteraction } from 'discord.js';
import { ModalBuilder } from 'discord.js';
import { DiscordEmbedLimits } from '../../discord/embed/DiscordEmbedLimits';
import { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';
import type { DiscordModalCodec } from '../../discord/modal/codec/DiscordModalCodec';
import { DiscordModalLimits } from '../../discord/modal/schema/DiscordModalLimits';
import type { RequestModalInputData } from '../../service/request/RequestModalInputData';
import type { RequestModalData } from './RequestModalData';

export class RequestModalCodec
  implements DiscordModalCodec<RequestModalInputData>
{
  protected static readonly CreateFieldsIds: Record<
    Capitalize<keyof RequestModalData['fields']>,
    string
  > = {
    Title: 'title',
    Description: 'description',
    Budget: 'budget',
  };

  protected modalData: RequestModalData;

  protected cachedModalData: APIModalInteractionResponseCallbackData | null =
    null;

  constructor(modalData: RequestModalData) {
    this.modalData = modalData;
  }

  public extractFromModal(
    interaction: ModalSubmitInteraction,
  ): RequestModalInputData {
    const ids = RequestModalCodec.CreateFieldsIds;
    const get = interaction.fields.getTextInputValue.bind(interaction.fields);

    const title = get(ids.Title);
    const description = get(ids.Description);
    const budget = get(ids.Budget);

    return {
      description,
      budget,
      title,
      userId: interaction.user.id,
    };
  }

  public createModal(customId: string): ModalBuilder {
    const data = this.modalData;

    if (this.cachedModalData) {
      const newData = structuredClone(this.cachedModalData);
      newData.custom_id = customId;

      return new ModalBuilder(newData);
    }

    const { modal, fields } = data;

    fields.title
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(
        Math.min(DiscordEmbedLimits.Title, DiscordModalLimits.MaxLength),
      )
      .setCustomId(RequestModalCodec.CreateFieldsIds.Title);

    fields.description
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(
        Math.min(DiscordEmbedLimits.Description, DiscordModalLimits.MaxLength),
      )
      .setCustomId(RequestModalCodec.CreateFieldsIds.Description);

    fields.budget
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100)
      .setCustomId(RequestModalCodec.CreateFieldsIds.Budget);

    modal.setTextInputs(...Object.values(fields));
    this.cachedModalData = modal.setCustomId('mock').toJSON();

    return this.createModal(customId);
  }

  public createFromData(
    data: RequestModalInputData,
    customId: string,
  ): ModalBuilder {
    const modalData = this.modalData;

    const modal = new SimplifiedModalBuilder(
      this.createModal(customId).toJSON(),
    );
    const fields = { ...modalData.fields };

    const { title, description, budget } = fields;

    title.setValue(data.title);
    description.setValue(data.description);
    budget.setValue(data.budget);

    return modal.setTextInputs(...Object.values(fields));
  }

  public equals(
    data: RequestModalInputData,
    interaction: ModalSubmitInteraction,
  ): boolean {
    const ids = RequestModalCodec.CreateFieldsIds;
    const get = interaction.fields.getTextInputValue.bind(interaction.fields);

    return (
      data.title === get(ids.Title)
      && data.description === get(ids.Description)
      && data.budget === get(ids.Budget)
    );
  }
}
