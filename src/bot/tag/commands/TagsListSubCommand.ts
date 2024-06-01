import type { ParentCommand, SubCommandData } from '@nyx-discord/core';
import {
  type CommandExecutionMeta,
  ObjectNotFoundError,
} from '@nyx-discord/core';
import { AbstractSubCommand } from '@nyx-discord/framework';
import type {
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
} from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import { nanoid } from 'nanoid';

import type { TagRepository } from '../../../hermes/database/TagRepository';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagActionsCustomIdCodec } from '../../../tag/action/codec/TagActionsCustomIdCodec';
import { TagAction } from '../../../tag/action/TagAction';
import type { TagMessagesParser } from '../../../tag/message/TagMessagesParser';
import { HermesMemberFetchCommandMiddleware } from '../../middleware/HermesMemberFetchCommandMiddleware';

export class TagsListSubCommand extends AbstractSubCommand {
  public static readonly DefaultData = {
    name: 'list',
    description: 'List all tags',
  };

  protected readonly data: SubCommandData = TagsListSubCommand.DefaultData;

  protected readonly messages: TagMessagesParser;

  protected readonly actions: TagActionsCustomIdCodec;

  protected readonly repository: TagRepository;

  constructor(
    parent: ParentCommand,
    messages: TagMessagesParser,
    actions: TagActionsCustomIdCodec,
    repository: TagRepository,
  ) {
    super(parent);

    this.data = messages.getListCommandData();
    this.messages = messages;
    this.actions = actions;
    this.repository = repository;
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
    meta: CommandExecutionMeta,
  ) {
    const member = meta.get(HermesMemberFetchCommandMiddleware.Key) as
      | HermesMember
      | undefined;
    if (!member) {
      throw new ObjectNotFoundError();
    }

    const tags = this.repository.getTags();
    const embed = this.messages.getListEmbed({ member }, tags);

    if (!tags.length) {
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });

      return;
    }

    const select = this.messages
      .getListSelect({ member }, tags)
      .setCustomId(nanoid(5));

    select.addOptions(
      tags.map((tag) => ({
        label: tag.name,
        description: tag.description,
        value: this.actions.createActionCustomId(tag.id, TagAction.enum.Info),
      })),
    );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      select,
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  }
}
