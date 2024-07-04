import type { CommandData } from '@nyx-discord/core';
import { IllegalStateError } from '@nyx-discord/core';
import type { EmbedBuilder } from 'discord.js';
import { nanoid } from 'nanoid';
import type { ConfigCommandOption } from '../../discord/command/DiscordCommandOptionSchema';
import { BasicHermesMessageParser } from '../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesPlaceholderErrorContext } from '../../hermes/message/context/HermesPlaceholderErrorContext';
import type { ErrorEmbedsData } from '../../hermes/message/error/ErrorEmbedsData';
import type { WithRequired } from '../../types/WithRequired';

import type { TagData } from '../data/TagData';
import type { TagModalData } from '../modal/TagModalData';
import type { TagPlaceholderContext } from './placeholder/TagPlaceholderContext';
import type { TagsMessagesSchema } from './TagsMessagesSchema';

export class TagMessagesParser extends BasicHermesMessageParser<
  typeof TagsMessagesSchema
> {
  protected cachedCreateModal: TagModalData | null = null;

  public getNotFoundErrorEmbed(
    context: HermesPlaceholderContext,
    id: string,
  ): EmbedBuilder {
    return this.parseEmbed(this.messages.notFound, context, {
      id,
    });
  }

  public getNoTagsTag(): TagData {
    return {
      ...this.messages.noTags,
      id: -1,
      createdAt: new Date(),
    };
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

  public getParentCommandData(): CommandData {
    return this.messages.command;
  }

  public getListCommandData(): CommandData {
    return this.messages.list.command;
  }

  public getListSelect(context: HermesPlaceholderContext, tags: TagData[]) {
    const select = this.parseSelect(this.messages.list.select, context);

    if (!tags.length) {
      select.setPlaceholder(this.messages.list.empty);
      select.addOptions({
        label: this.messages.list.empty,
        value: 'no-tags',
      });

      return select.setDisabled(true);
    }

    return select;
  }

  public getListEmbed(
    context: HermesPlaceholderContext,
    tags: TagData[],
    inlineOverride?: boolean,
  ) {
    const embed = this.messages.list.embed;

    if (!tags.length) {
      const builder = this.parseEmbed(embed, context);
      return builder.setDescription(
        this.parsePlaceholders(this.messages.list.empty, context),
      );
    }

    const dataContexts: HermesPlaceholderContext[] = tags.map((tag) => ({
      ...context,
      services: {
        ...context.services,
        tag,
      },
    }));

    return this.parseTemplatedEmbed(
      embed,
      context,
      dataContexts,
      inlineOverride,
    );
  }

  public getCreateCommandData(): CommandData {
    return this.messages.create.command;
  }

  public getCreateSuccessEmbed(context: TagPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.create.success, context);
  }

  public getCreateErrorEmbeds(
    context: WithRequired<HermesPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.create.error, context);
  }

  public getCreateModal(): TagModalData {
    if (this.cachedCreateModal) {
      return this.cachedCreateModal;
    }

    const modal = this.parseModal(this.messages.create.modal);
    const { fields } = this.messages.create.modal;

    const nameField = this.parseModalField(fields.name);
    const descriptionField = this.parseModalField(fields.description);
    const colorField = this.parseModalField(fields.color);

    const data = {
      modal,
      fields: {
        name: nameField,
        description: descriptionField,
        color: colorField,
      },
    };

    this.cachedCreateModal = data;
    return data;
  }

  public getCreateLogEmbed(
    context: WithRequired<TagPlaceholderContext, 'update'>,
  ) {
    return this.parseEmbed(this.messages.create.log, context);
  }

  public getInfoCommandData() {
    return this.messages.info.command;
  }

  public getInfoEmbed(context: TagPlaceholderContext) {
    return this.parseEmbed(this.messages.info.embed, context);
  }

  public getUpdateCommandData(): CommandData {
    return this.messages.update.command;
  }

  public getUpdateCommandOption(): ConfigCommandOption {
    return this.messages.update.command.options.tag;
  }

  public getUpdateSuccessEmbed(context: TagPlaceholderContext) {
    return this.parseEmbed(this.messages.update.success, context);
  }

  public getUpdateErrorEmbeds(
    context: WithRequired<TagPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.update.error, context);
  }

  public getUpdateLogEmbed(
    context: WithRequired<TagPlaceholderContext, 'update'>,
  ) {
    return this.parseEmbed(this.messages.update.log, context);
  }

  public getDeleteProtectedErrorEmbed(
    context: TagPlaceholderContext,
  ): EmbedBuilder {
    const fullContext: WithRequired<HermesPlaceholderContext, 'error'> = {
      ...context,
      error: {
        instance: new IllegalStateError('Tag is protected'),
        id: nanoid(5),
      },
    };

    return this.parseEmbed(this.messages.delete.protectedError, fullContext);
  }

  public getDeleteCommandData() {
    return this.messages.delete.command;
  }

  public getDeleteSuccessEmbed(context: TagPlaceholderContext) {
    return this.parseEmbed(this.messages.delete.success, context);
  }

  public getDeleteErrorEmbeds(
    context: WithRequired<TagPlaceholderContext, 'error'>,
  ): ErrorEmbedsData {
    return this.parseErrorEmbeds(this.messages.delete.error, context);
  }

  public getDeleteConfirmEmbed(context: TagPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.delete.confirm, context);
  }

  public getDeleteLogEmbed(
    context: WithRequired<TagPlaceholderContext, 'update'>,
  ) {
    return this.parseEmbed(this.messages.delete.log, context);
  }
}
