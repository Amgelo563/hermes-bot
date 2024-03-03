import type { CommandData } from '@nyx-discord/core';
import type {
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

import { DiscordEmbedLimits } from '../../discord/embed/DiscordEmbedLimits';
import type { OptionalInlineField } from '../../discord/embed/OptionalInlineField';
import { BasicHermesMessageParser } from '../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesPlaceholderErrorContext } from '../../hermes/message/context/HermesPlaceholderErrorContext';
import type { ErrorEmbedsData } from '../../hermes/message/error/ErrorEmbedsData';
import type { OfferData } from '../../service/offer/OfferData';
import type { WithRequired } from '../../types/WithRequired';
import type { OfferModalData } from '../modal/OfferModalData';
import type { OfferMessagesSchema } from './OfferMessagesSchema';
import type { OfferPlaceholderContext } from './placeholder/OfferPlaceholderContext';

export class OfferMessagesParser extends BasicHermesMessageParser<
  typeof OfferMessagesSchema
> {
  public getParentCommandData(): CommandData {
    return this.messages.parentCommand;
  }

  public getEmptyMessage(): string {
    return this.messages.empty;
  }

  public getNotFoundErrorEmbed(
    context: HermesPlaceholderContext,
    id: string,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.notFoundError, context, {
      id,
    });
  }

  public getInfoCommandData() {
    return this.messages.info.command;
  }

  public getInfoLinkButton(context: OfferPlaceholderContext): ButtonBuilder {
    const { offer } = context.services;
    const link = `https://discord.com/channels/${offer.guildId}/${offer.channelId}/${offer.messageId}`;

    return this.parseLinkButton(this.messages.info.linkButton, context, link);
  }

  public getCreateCommandData(): CommandData {
    return this.messages.create.command;
  }

  public getCreateModal(): OfferModalData {
    const modal = this.parseModal(this.messages.create.modal);
    const { fields } = this.messages.create.modal;

    const titleField = this.parseModalField(fields.title);
    const descriptionField = this.parseModalField(fields.description);
    const priceField = this.parseModalField(fields.price);
    const imageField = this.parseModalField(fields.image);
    const thumbnailField = this.parseModalField(fields.thumbnail);

    return {
      modal,
      fields: {
        title: titleField,
        description: descriptionField,
        price: priceField,
        image: imageField,
        thumbnail: thumbnailField,
      },
    };
  }

  public getCreateTagSelect(
    context: OfferPlaceholderContext,
  ): StringSelectMenuBuilder {
    return this.parseSelect(this.messages.create.tagSelect, context);
  }

  public getCreatePreviewingEmbed(
    context: OfferPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.create.previewing, context);
  }

  public getCreateSuccessEmbed(context: OfferPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.create.success, context);
  }

  public getCreateErrorEmbeds(
    context: HermesPlaceholderErrorContext,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.create.error, context);
  }

  public getCreateWarnEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.create.requirements.warn,
      context,
      reasons,
    );
  }

  public getCreateDenyEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.create.requirements.deny,
      context,
      reasons,
    );
  }

  public getUpdateCommandData() {
    return this.messages.update.command;
  }

  public getUpdatePreviewingEmbed(
    context: OfferPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.update.previewing, context);
  }

  public getUpdateSuccessEmbed(context: OfferPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.update.success, context);
  }

  public getUpdateErrorEmbeds(
    context: WithRequired<OfferPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.update.error, context);
  }

  public getUpdateDenyEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.update.requirements.deny,
      context,
      reasons,
    );
  }

  public getUpdateWarnEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.update.requirements.warn,
      context,
      reasons,
    );
  }

  public getUpdateLogEmbed(
    context: WithRequired<OfferPlaceholderContext, 'update'>,
  ) {
    return this.parseEmbed(this.messages.update.log, context);
  }

  public getRepostCommandData() {
    return this.messages.repost.command;
  }

  public getRepostButton(
    customId: string,
    context: OfferPlaceholderContext,
  ): ButtonBuilder {
    return this.parseButton(this.messages.repost.button, context).setCustomId(
      customId,
    );
  }

  public getRepostDenyEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.repost.requirements.deny,
      context,
      reasons,
    );
  }

  public getRepostWarnEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.repost.requirements.warn,
      context,
      reasons,
    );
  }

  public getRepostErrorEmbeds(
    context: WithRequired<OfferPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.repost.error, context);
  }

  public getRepostSuccessEmbed(context: OfferPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.repost.success, context);
  }

  public getPostEmbed(context: OfferPlaceholderContext) {
    const newOffer: Record<string, unknown> = { ...context.services.offer };

    for (const [key, value] of Object.entries(newOffer)) {
      if (typeof value !== 'string') continue;
      newOffer[key] = this.escape(value);
    }

    const newOfferData = newOffer as OfferData;

    const fullContext = {
      ...context,
      services: {
        offer: newOfferData,
      },
    };

    return this.parseEmbed(
      this.messages.post,
      fullContext,
      undefined,
      DiscordEmbedLimits.ShortDescription,
    );
  }

  public getDeleteCommandData() {
    return this.messages.delete.command;
  }

  public getDeleteSuccessEmbed(context: OfferPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.delete.success, context);
  }

  public getDeleteErrorEmbeds(
    context: WithRequired<OfferPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.delete.error, context);
  }

  public getDeleteConfirmEmbed(context: OfferPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.delete.confirm, context);
  }

  public getDeleteLogEmbed(
    context: WithRequired<OfferPlaceholderContext, 'update'>,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.delete.log, context);
  }
}
