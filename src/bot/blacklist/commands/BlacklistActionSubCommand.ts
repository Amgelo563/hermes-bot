import type { ParentCommand } from '@nyx-discord/core';
import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction} from 'discord.js';
import {
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from 'discord.js';

import type {
  BlacklistActionOptions,
  BlacklistActionType,
} from '../../../blacklist/action/BlacklistAction';
import type { BlacklistActionsManager } from '../../../blacklist/action/BlacklistActionsManager';
import type { DiscordBlacklistAgent } from '../../../blacklist/discord/DiscordBlacklistAgent';
import type { IdentifiableBlacklist } from '../../../blacklist/identity/IdentifiableBlacklist';
import { createIdentifiableBlacklist } from '../../../blacklist/identity/IdentifiableBlacklist';
import type { BlacklistMessagesParser } from '../../../blacklist/message/read/BlacklistMessagesParser';
import type { BlacklistRepository } from '../../../blacklist/repository/BlacklistRepository';
import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import { AbstractActionSubCommand } from '../../action/AbstractActionSubCommand';

export class BlacklistActionSubCommand extends AbstractActionSubCommand<
  IdentifiableBlacklist,
  BlacklistActionOptions,
  DiscordBlacklistAgent
> {
  protected readonly repository: BlacklistRepository;

  protected readonly config: HermesConfigWrapper;

  protected readonly messages: BlacklistMessagesParser;

  protected readonly staffOnly: boolean;

  constructor(
    parent: ParentCommand,
    data: CommandSchemaType<'user'>,
    config: HermesConfigWrapper,
    agent: DiscordBlacklistAgent,
    messages: BlacklistMessagesParser,
    actions: BlacklistActionsManager,
    action: BlacklistActionType,
    repository: BlacklistRepository,
    staffOnly: boolean,
    allowNonMembers: boolean = true,
  ) {
    super(
      parent,
      data,
      data.options.user,
      actions,
      action,
      agent,
      allowNonMembers,
    );
    this.repository = repository;
    this.config = config;
    this.staffOnly = staffOnly;
    this.messages = messages;
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    if (
      this.staffOnly
      && (!interaction.inCachedGuild() || !this.config.isStaff(interaction.member))
    ) {
      const { user } = interaction;
      const member = this.agent.mockMember(user);
      const error = this.messages.getNotAllowedErrorEmbed({ member });
      await interaction.reply({
        ephemeral: true,
        embeds: [error],
      });
      return;
    }

    await super.execute(interaction);
  }

  public async autocomplete(
    interaction: AutocompleteInteraction,
  ): Promise<void> {
    await interaction.respond([]);
  }

  public createData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName(this.data.name)
      .setDescription(this.data.description)
      .addUserOption(
        new SlashCommandUserOption()
          .setName(this.data.options.option.name)
          .setDescription(this.data.options.option.description)
          .setRequired(false),
      );
  }

  protected async find(id: string): Promise<IdentifiableBlacklist | null> {
    const data = await this.repository.find(id);
    if (!data) return null;

    return createIdentifiableBlacklist(data);
  }

  protected async replyNotFound(
    _context: HermesPlaceholderContext,
    interaction: ChatInputCommandInteraction,
    id: string,
  ): Promise<void> {
    await this.actionsManager.executeNotFound(interaction, id);
  }
}
