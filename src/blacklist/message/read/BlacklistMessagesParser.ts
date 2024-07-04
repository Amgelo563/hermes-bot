import { IllegalStateError } from '@nyx-discord/core';
import type { EmbedBuilder } from 'discord.js';
import { nanoid } from 'nanoid';

import type { ModalDataWithFields } from '../../../discord/modal/schema/DiscordModalSchema';
import { BasicHermesMessageParser } from '../../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { HermesPlaceholderErrorContext } from '../../../hermes/message/context/HermesPlaceholderErrorContext';
import type { ErrorEmbedsData } from '../../../hermes/message/error/ErrorEmbedsData';
import type { WithRequired } from '../../../types/WithRequired';
import type { BlacklistModalData } from '../../modal/BlacklistModalData';
import type { BlacklistPlaceholderContext } from '../placeholder/BlacklistPlaceholderContext';
import type { BlacklistPlaceholderData } from '../placeholder/BlacklistPlaceholderData';
import type { BlacklistMessagesSchema } from './BlacklistMessagesSchema';

export class BlacklistMessagesParser extends BasicHermesMessageParser<
  typeof BlacklistMessagesSchema
> {
  public getPermanentDuration(): string {
    return this.messages.permanent;
  }

  public getNotAllowedErrorEmbed(
    context: HermesPlaceholderContext,
  ): EmbedBuilder {
    const errorContext = {
      ...context,
      error: {
        instance: new IllegalStateError('Not allowed'),
        id: nanoid(5),
      },
    } satisfies HermesPlaceholderErrorContext;

    return this.parseEmbed(this.messages.notAllowed, errorContext);
  }

  public getParentCommandData() {
    return this.messages.command;
  }

  public getInfoCommandData() {
    return this.messages.info.command;
  }

  public getInfoEmbed(context: BlacklistPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.info.embed, context);
  }

  public getCreateCommandData() {
    return this.messages.create.command;
  }

  public getCreateModalData(): ModalDataWithFields<keyof BlacklistModalData> {
    return this.messages.create.modal;
  }

  public getCreateConfirmEmbed(
    context: BlacklistPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.create.confirm, context);
  }

  public getCreateSuccessEmbed(
    context: BlacklistPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.create.success, context);
  }

  public getCreateLogEmbed(context: BlacklistPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.create.log, context);
  }

  public getCreateErrorEmbeds(
    context: WithRequired<BlacklistPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.create.error, context);
  }

  public getAlreadyBlacklistedEmbed(
    context: HermesPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.alreadyBlacklisted, context);
  }

  public getListCommandData() {
    return this.messages.list.command;
  }

  public getListEmbed(
    context: HermesPlaceholderContext,
    blacklists: BlacklistPlaceholderData[],
  ): EmbedBuilder {
    if (blacklists.length === 0) {
      return this.parseEmbed(
        {
          ...this.messages.list.embed,
          description: this.messages.list.empty,
        },
        context,
      );
    }

    const fieldContexts = blacklists.map((blacklist) => ({
      ...context,
      blacklist: blacklist,
    }));

    return this.parseTemplatedEmbed(
      this.messages.list.embed,
      context,
      fieldContexts,
    );
  }

  public getDeleteCommandData() {
    return this.messages.delete.command;
  }

  public getDeleteSuccessEmbed(
    context: BlacklistPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.delete.success, context);
  }

  public getDeleteLogEmbed(context: BlacklistPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.delete.log, context);
  }

  public getDeleteErrorEmbeds(
    context: WithRequired<BlacklistPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.delete.error, context);
  }

  public getNotBlacklistedEmbed(
    context: HermesPlaceholderContext,
    id: string,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.notBlacklisted, context, { id });
  }

  public getBlacklistRequirementEmbed(
    context: BlacklistPlaceholderContext,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.requirementDeny, context);
  }

  public getExpireLogEmbed(context: BlacklistPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.expire.log, context);
  }

  public getExpireErrorEmbed(
    context: WithRequired<BlacklistPlaceholderContext, 'error'>,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.expire.error, context);
  }
}
