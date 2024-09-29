import type { ParentCommand } from '@nyx-discord/core';
import { AbstractSubCommand } from '@nyx-discord/framework';
import type {
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
} from 'discord.js';
import {
  ActionRowBuilder,
  Collection,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { nanoid } from 'nanoid';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { DiscordServiceAgent } from '../../../service/discord/DiscordServiceAgent';
import type { TagActionsCustomIdCodec } from '../../../tag/action/codec/TagActionsCustomIdCodec';
import { TagAction } from '../../../tag/action/TagAction';
import type { TagRepository } from '../../../tag/database/TagRepository';
import type { TagMessagesParser } from '../../../tag/message/TagMessagesParser';

export class TagsListSubCommand extends AbstractSubCommand {
  protected readonly data: CommandSchemaType;

  protected readonly messages: TagMessagesParser;

  protected readonly actions: TagActionsCustomIdCodec;

  protected readonly repository: TagRepository;

  protected readonly agent: DiscordServiceAgent;

  constructor(
    parent: ParentCommand,
    messages: TagMessagesParser,
    actions: TagActionsCustomIdCodec,
    repository: TagRepository,
    agent: DiscordServiceAgent,
  ) {
    super(parent);

    this.data = messages.getListCommandData();
    this.messages = messages;
    this.actions = actions;
    this.repository = repository;
    this.agent = agent;
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const member = await this.agent.fetchMemberFromInteraction(interaction);
    const tags = this.repository.getTags();
    const embed = this.messages.getListEmbed({ member }, tags);

    if (!tags.length) {
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });

      return;
    }

    const tagsEntries = tags.map((tag) => {
      const id = this.actions.createActionCustomId(tag.id, TagAction.enum.Info);
      return [id, tag] as const;
    });
    const tagsCollection = new Collection(tagsEntries);

    const select = this.messages
      .getListSelect({ member }, tagsCollection)
      .setCustomId(nanoid(5));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      select,
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  }

  protected createData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName(this.data.name)
      .setDescription(this.data.description);
  }
}
