import { ActionRowWrapper } from '@nyx-discord/framework';
import type { ButtonBuilder, EmbedBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import type { z } from 'zod';

import { BasicHermesMessageParser } from '../BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../context/HermesPlaceholderContext';
import type { HermesPlaceholderErrorContext } from '../context/HermesPlaceholderErrorContext';
import type { ErrorEmbedsData } from '../error/ErrorEmbedsData';
import type { GeneralMessagesSchema } from './GeneralMessagesSchema';

export class GeneralMessagesParser extends BasicHermesMessageParser<
  typeof GeneralMessagesSchema
> {
  public getBooleans(): z.infer<typeof GeneralMessagesSchema>['booleans'] {
    return this.messages.booleans;
  }

  public getContinueRow(
    yesId: string,
    noId: string,
    context: HermesPlaceholderContext,
    safe: boolean,
  ): ActionRowBuilder<ButtonBuilder> {
    const buttonConfig = safe
      ? this.messages.continue.safe
      : this.messages.continue.unsafe;

    const yesButton = this.parseButton(buttonConfig.yes, context).setCustomId(
      yesId,
    );

    const noButton = this.parseButton(buttonConfig.no, context).setCustomId(
      noId,
    );

    return new ActionRowBuilder<ButtonBuilder>().addComponents([
      yesButton,
      noButton,
    ]);
  }

  public getSessionCreateRow(
    cancelId: string,
    updateId: string,
    confirmId: string,
    context: HermesPlaceholderContext,
    allowConfirm: boolean,
  ): ActionRowWrapper<ButtonBuilder> {
    const row = new ActionRowWrapper<ButtonBuilder>();

    const cancelButton = this.getCancelButton(cancelId, context);
    const editButton = this.getUpdateButton(updateId, context);
    const confirmButton = this.getConfirmButton(confirmId, context).setDisabled(
      !allowConfirm,
    );

    row.add(cancelButton, editButton, confirmButton);

    return row;
  }

  public getConfirmButton(
    customId: string,
    context: HermesPlaceholderContext,
  ): ButtonBuilder {
    return this.parseButton(this.messages.confirm.button, context).setCustomId(
      customId,
    );
  }

  public getCancelButton(
    customId: string,
    context: HermesPlaceholderContext,
  ): ButtonBuilder {
    return this.parseButton(this.messages.cancel.button, context).setCustomId(
      customId,
    );
  }

  public getCancelledEmbed(context: HermesPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.cancel.embed, context);
  }

  public getUpdateButton(
    customId: string,
    context: HermesPlaceholderContext,
  ): ButtonBuilder {
    return this.parseButton(this.messages.updateButton, context).setCustomId(
      customId,
    );
  }

  public getDeleteButton(
    customId: string,
    context: HermesPlaceholderContext,
  ): ButtonBuilder {
    return this.parseButton(this.messages.deleteButton, context).setCustomId(
      customId,
    );
  }

  public getUnknownErrorEmbeds(
    context: HermesPlaceholderErrorContext,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.unknownError, context);
  }
}
