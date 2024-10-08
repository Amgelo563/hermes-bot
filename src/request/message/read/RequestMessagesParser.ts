import type {
  ButtonBuilder,
  EmbedBuilder,
  MessageCreateOptions,
  StringSelectMenuBuilder,
} from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import { DiscordEmbedLimits } from '../../../discord/embed/DiscordEmbedLimits';
import type { OptionalInlineField } from '../../../discord/embed/OptionalInlineField';
import { BasicHermesMessageParser } from '../../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { HermesPlaceholderErrorContext } from '../../../hermes/message/context/HermesPlaceholderErrorContext';
import type { ErrorEmbedsData } from '../../../hermes/message/error/ErrorEmbedsData';
import type { OfferPlaceholderContext } from '../../../offer/message/placeholder/OfferPlaceholderContext';
import type { WithRequired } from '../../../types/WithRequired';
import type { RequestDataWithMember } from '../../data/RequestDataWithMember';
import type { RequestModalData } from '../../modal/RequestModalData';
import type { RequestPlaceholderContext } from '../placeholder/RequestPlaceholderContext';
import type { RequestMessagesSchema } from './RequestMessagesSchema';

export class RequestMessagesParser extends BasicHermesMessageParser<
  typeof RequestMessagesSchema
> {
  public getParentCommandData(): CommandSchemaType {
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

  public getInfoLinkButton(context: RequestPlaceholderContext): ButtonBuilder {
    const { request } = context.services;
    const link = `https://discord.com/channels/${request.guildId}/${request.channelId}/${request.messageId}`;

    return this.parseLinkButton(this.messages.info.linkButton, context, link);
  }

  public getCreateCommandData(): CommandSchemaType {
    return this.messages.create.command;
  }

  public getCreateModal(): RequestModalData {
    const modal = this.parseModal(this.messages.create.modal);
    const { fields } = this.messages.create.modal;

    const titleField = this.parseModalField(fields.title);
    const descriptionField = this.parseModalField(fields.description);
    const budgetField = this.parseModalField(fields.budget);

    return {
      modal,
      fields: {
        title: titleField,
        description: descriptionField,
        budget: budgetField,
      },
    };
  }

  public getCreateTagSelect(
    context: RequestPlaceholderContext,
  ): StringSelectMenuBuilder {
    return this.parseSelect(this.messages.create.tagSelect, context);
  }

  public getCreatePreviewingEmbed(
    context: RequestPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.create.previewing, context);
  }

  public getCreateSuccessEmbed(
    context: RequestPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.create.success, context);
  }

  public getCreateErrorEmbeds(
    context: HermesPlaceholderErrorContext,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.create.error, context);
  }

  public getCreateWarnEmbed(
    context: RequestPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.create.requirements.warn,
      context,
      reasons,
    );
  }

  public getCreateDenyEmbed(
    context: RequestPlaceholderContext,
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
    context: RequestPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.update.previewing, context);
  }

  public getUpdateSuccessEmbed(
    context: RequestPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.update.success, context);
  }

  public getUpdateErrorEmbeds(
    context: WithRequired<RequestPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.update.error, context);
  }

  public getUpdateDenyEmbed(
    context: RequestPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.update.requirements.deny,
      context,
      reasons,
    );
  }

  public getUpdateWarnEmbed(
    context: RequestPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.update.requirements.warn,
      context,
      reasons,
    );
  }

  public getUpdateLogEmbed(
    context: WithRequired<RequestPlaceholderContext, 'update'>,
  ) {
    return this.parseEmbed(this.messages.update.log, context);
  }

  public getRepostCommandData() {
    return this.messages.repost.command;
  }

  public getRepostButton(
    customId: string,
    context: RequestPlaceholderContext,
  ): ButtonBuilder {
    return this.parseButton(this.messages.repost.button, context).setCustomId(
      customId,
    );
  }

  public getRepostDenyEmbed(
    context: RequestPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.repost.requirements.deny,
      context,
      reasons,
    );
  }

  public getRepostWarnEmbed(
    context: RequestPlaceholderContext,
    reasons: OptionalInlineField[],
  ) {
    return this.getRequirementEmbed(
      this.messages.repost.requirements.warn,
      context,
      reasons,
    );
  }

  public getRepostErrorEmbeds(
    context: WithRequired<RequestPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.repost.error, context);
  }

  public getRepostSuccessEmbed(
    context: RequestPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.repost.success, context);
  }

  public getPostEmbed(context: RequestPlaceholderContext) {
    const newRequest: Record<string, unknown> = { ...context.services.request };

    for (const [key, value] of Object.entries(newRequest)) {
      newRequest[key] = typeof value === 'string' ? this.escape(value) : value;
    }

    const escapedData = newRequest as RequestDataWithMember;
    const fullContext = {
      ...context,
      services: {
        request: escapedData,
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

  public getDeleteSuccessEmbed(
    context: RequestPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.delete.success, context);
  }

  public getDeleteErrorEmbeds(
    context: WithRequired<RequestPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.delete.error, context);
  }

  public getDeleteConfirmEmbed(
    context: RequestPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.delete.confirm, context);
  }

  public getDeleteLogEmbed(
    context: WithRequired<RequestPlaceholderContext, 'update'>,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.delete.log, context);
  }

  public getStickyMessage(
    context: HermesPlaceholderContext,
  ): MessageCreateOptions {
    let embeds: EmbedBuilder[];
    if (Array.isArray(this.messages.stickyMessage)) {
      embeds = this.messages.stickyMessage.map((embed) =>
        this.parseEmbed(embed, context),
      );
    } else {
      embeds = [this.parseEmbed(this.messages.stickyMessage, context)];
    }

    return { embeds };
  }

  public getSearchCommandData() {
    return this.messages.search.command;
  }

  public getSearchErrorEmbeds(
    context: WithRequired<OfferPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.search.error, context);
  }

  public getSearchEmbed(
    context: HermesPlaceholderContext,
    datas: RequestDataWithMember[],
  ): EmbedBuilder {
    if (datas.length === 0) {
      return this.parseEmbed(
        {
          ...this.messages.search.embed,
          description: this.messages.search.noResults,
        },
        context,
      );
    }

    return this.parseTemplatedEmbed(
      this.messages.search.embed,
      context,
      datas.map((request) => ({
        ...context,
        services: { request },
      })),
    );
  }
}
