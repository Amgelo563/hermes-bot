import type { CommandData } from '@nyx-discord/core';
import type {
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

import type { OptionalInlineField } from '../../discord/embed/OptionalInlineField';
import { BasicHermesMessageParser } from '../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesPlaceholderErrorContext } from '../../hermes/message/context/HermesPlaceholderErrorContext';
import type { ErrorEmbedsData } from '../../hermes/message/error/ErrorEmbedsData';
import type { RequestData } from '../../service/request/RequestData';
import type { WithRequired } from '../../types/WithRequired';
import type { RequestModalData } from '../modal/RequestModalData';
import type { RequestPlaceholderContext } from './placeholder/RequestPlaceholderContext';
import type { RequestMessagesSchema } from './RequestMessagesSchema';

export class RequestMessagesParser extends BasicHermesMessageParser<
  typeof RequestMessagesSchema
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

  public getInfoLinkButton(context: RequestPlaceholderContext): ButtonBuilder {
    const { request } = context.services;
    const link = `https://discord.com/channels/${request.guildId}/${request.channelId}/${request.messageId}`;

    return this.parseLinkButton(this.messages.info.linkButton, context, link);
  }

  public getCreateCommandData(): CommandData {
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
      if (typeof value !== 'string') continue;
      newRequest[key] = this.escape(value);
    }

    const escapedData = newRequest as RequestData;
    const fullContext = {
      ...context,
      services: {
        request: escapedData,
      },
    };

    return this.parseEmbed(this.messages.post, fullContext);
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
}
