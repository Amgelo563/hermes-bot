import type { ModalBuilder, ModalSubmitInteraction } from 'discord.js';
import {
  type APIModalInteractionResponseCallbackData,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

import { DiscordEmbedLimits } from '../../discord/embed/DiscordEmbedLimits';
import { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';
import type { DiscordModalCodec } from '../../discord/modal/codec/DiscordModalCodec';
import { DiscordModalLimits } from '../../discord/modal/schema/DiscordModalLimits';
import type { HermesMember } from '../../service/member/HermesMember';
import type { OfferCreateData } from '../data/OfferCreateData';
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
    member: HermesMember,
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
      member,
      memberId: interaction.user.id,
      tags: presentData?.tags ?? [],
    };
  }

  public createModal(
    customId: string,
    presentData?: OfferCreateData,
  ): ModalBuilder {
    const data = this.modalData;

    if (this.cachedModalData) {
      const newData = structuredClone(this.cachedModalData);
      newData.custom_id = customId;

      const builder = new SimplifiedModalBuilder(newData);
      if (!presentData) return builder;

      return this.populateWithData(presentData, builder);
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
        Math.min(
          DiscordEmbedLimits.ShortDescription,
          DiscordModalLimits.MaxLength,
        ),
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

  protected populateWithData(
    data: OfferCreateData,
    modal: SimplifiedModalBuilder,
  ): ModalBuilder {
    const { fields } = this.modalData;

    const titleField = new TextInputBuilder(fields.title.toJSON());
    const descriptionField = new TextInputBuilder(fields.description.toJSON());
    const priceField = new TextInputBuilder(fields.price.toJSON());
    const thumbnailField = new TextInputBuilder(fields.thumbnail.toJSON());
    const imageField = new TextInputBuilder(fields.image.toJSON());

    titleField.setValue(data.title);
    descriptionField.setValue(data.description);
    priceField.setValue(data.price);
    thumbnailField.setValue(data.thumbnail);
    imageField.setValue(data.image);

    return modal.setTextInputs(
      titleField,
      descriptionField,
      priceField,
      thumbnailField,
      imageField,
    );
  }
}
