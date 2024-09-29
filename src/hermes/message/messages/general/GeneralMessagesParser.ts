import { ActionRowWrapper } from '@nyx-discord/framework';
import type {
  ButtonBuilder,
  Collection,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import type { z } from 'zod';

import type { DateFilterStateKey } from '../../../../bot/search/sessions/filter/filters/ServiceSearchDateFilter';
import type { HermesMember } from '../../../../service/member/HermesMember';
import { HermesMemberTypeEnum } from '../../../../service/member/HermesMemberType';
import type { TagData } from '../../../../tag/data/TagData';
import { BasicHermesMessageParser } from '../../BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../context/HermesPlaceholderContext';
import type { HermesPlaceholderErrorContext } from '../../context/HermesPlaceholderErrorContext';
import type { ErrorEmbedsData } from '../../error/ErrorEmbedsData';
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

  public getNotInGuildErrorEmbed(
    context: HermesPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.notInGuildError, context);
  }

  public getUnknownMember(id: string): HermesMember {
    const { unknownMember } = this.messages;
    return {
      ...unknownMember,
      username: `${unknownMember.username} \`${id}\``,
      id,
      roles: [],
      roleNames: [],
      globalName: unknownMember.username,
      tag: `${unknownMember.username}#${unknownMember.discriminator}`,
      type: HermesMemberTypeEnum.UnknownUser,
    };
  }

  public getDateFilterSelectMenu(
    context: HermesPlaceholderContext,
    values: Record<DateFilterStateKey, string>,
  ): StringSelectMenuBuilder {
    return this.parseSelectWithOptions(
      this.messages.filters.date,
      context,
      values,
    );
  }

  public getTagFilterSelectMenu(
    context: HermesPlaceholderContext,
    tags: Collection<string, TagData>,
  ): StringSelectMenuBuilder {
    const options = tags.map((tag, value) => {
      const optionContext = { ...context, services: { tag } };
      return this.parseSelectOption(
        this.messages.filters.tag.options.tag,
        optionContext,
        value,
      );
    });

    const select = this.parseSelect(this.messages.filters.tag, context);
    return select.setOptions(options);
  }
}
