import {
  type APIModalInteractionResponseCallbackData,
  TextInputStyle,
} from 'discord-api-types/v10';
import type { ModalSubmitInteraction } from 'discord.js';
import { ModalBuilder } from 'discord.js';
import { DiscordEmbedLimits } from '../../discord/embed/DiscordEmbedLimits';
import { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';
import type { DiscordModalCodec } from '../../discord/modal/codec/DiscordModalCodec';
import { DiscordModalLimits } from '../../discord/modal/schema/DiscordModalLimits';
import type { OfferCreateData } from '../../service/offer/OfferCreateData';
import type { OfferModalData } from './OfferModalData';

export class OfferModalCodec implements DiscordModalCodec<OfferCreateData> {
  protected static readonly CreateFieldsIds: Record<
    Capitalize<keyof OfferModalData['fields']>,
    string
  > = {
    Title: 'title',
    Description: 'description',
    Price: 'price',
    Image: 'image',
    Thumbnail: 'thumbnail',
  };

  protected readonly modalData: OfferModalData;

  protected cachedModalData: APIModalInteractionResponseCallbackData | null =
    null;

  constructor(modalData: OfferModalData) {
    this.modalData = modalData;
  }

  public extractFromModal(
    interaction: ModalSubmitInteraction,
    presentData?: OfferCreateData,
  ): OfferCreateData {
    const ids = OfferModalCodec.CreateFieldsIds;
    const get = interaction.fields.getTextInputValue.bind(interaction.fields);

    const title = get(ids.Title);
    const description = get(ids.Description);
    const price = get(ids.Price);
    const thumbnail = get(ids.Thumbnail);
    const image = get(ids.Image);

    return {
      description,
      price,
      title,
      thumbnail,
      image,
      userId: interaction.user.id,
      tags: presentData?.tags ?? [],
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
      .setCustomId(OfferModalCodec.CreateFieldsIds.Title);

    fields.description
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(
        Math.min(DiscordEmbedLimits.Description, DiscordModalLimits.MaxLength),
      )
      .setCustomId(OfferModalCodec.CreateFieldsIds.Description);

    fields.price
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(100)
      .setCustomId(OfferModalCodec.CreateFieldsIds.Price);

    fields.thumbnail
      .setRequired(false)
      .setStyle(TextInputStyle.Short)
      .setCustomId(OfferModalCodec.CreateFieldsIds.Thumbnail);

    fields.image
      .setRequired(false)
      .setStyle(TextInputStyle.Short)
      .setCustomId(OfferModalCodec.CreateFieldsIds.Image);

    modal.setTextInputs(...Object.values(fields));
    this.cachedModalData = modal.setCustomId('mock').toJSON();

    return this.createModal(customId);
  }

  public createFromData(data: OfferCreateData, customId: string): ModalBuilder {
    const modalData = this.modalData;

    const modal = new SimplifiedModalBuilder(
      this.createModal(customId).toJSON(),
    );
    const fields = structuredClone({ ...modalData.fields });

    const { title, description, price, thumbnail, image } = fields;

    title.setValue(data.title);
    description.setValue(data.description);
    price.setValue(data.price);
    thumbnail.setValue(data.thumbnail);
    image.setValue(data.image);

    return modal.setTextInputs(...Object.values(fields));
  }

  public equals(
    data: OfferCreateData,
    interaction: ModalSubmitInteraction,
  ): boolean {
    const ids = OfferModalCodec.CreateFieldsIds;
    const get = interaction.fields.getTextInputValue.bind(interaction.fields);

    return (
      get(ids.Title) === data.title
      && get(ids.Description) === data.description
      && get(ids.Price) === data.price
      && get(ids.Thumbnail) === data.thumbnail
      && get(ids.Image) === data.image
    );
  }
}
