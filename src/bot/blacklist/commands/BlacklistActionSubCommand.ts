import type { ParentCommand } from '@nyx-discord/core';
import { AbstractSubCommand } from '@nyx-discord/framework';
import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
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
import type { AbstractActionsManager } from '../../../service/action/AbstractActionsManager';
import type { DiscordServiceAgent } from '../../../service/discord/DiscordServiceAgent';

export class BlacklistActionSubCommand extends AbstractSubCommand {
  protected readonly repository: BlacklistRepository;

  protected readonly config: HermesConfigWrapper;

  protected readonly messages: BlacklistMessagesParser;

  protected readonly staffOnly: boolean;

  protected readonly actionsManager: AbstractActionsManager<
    IdentifiableBlacklist,
    BlacklistActionOptions,
    DiscordBlacklistAgent,
    any
  >;

  protected readonly data: CommandSchemaType<'user'>;

  protected readonly optionId: string;

  protected readonly action: BlacklistActionOptions[number];

  protected readonly agent: DiscordServiceAgent;

  protected readonly allowNonMembers: boolean;

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
    super(parent);
    this.repository = repository;
    this.config = config;
    this.staffOnly = staffOnly;
    this.messages = messages;
    this.actionsManager = actions;
    this.data = data;
    this.optionId = data.options.user.name;
    this.action = action;
    this.agent = agent;
    this.allowNonMembers = allowNonMembers;
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const user = interaction.options.getUser(this.optionId) ?? interaction.user;
    if (user.bot) {
      const member = this.agent.mockMember(user);
      const error = this.messages.getNotAllowedErrorEmbed({ member });
      await interaction.reply({
        ephemeral: true,
        embeds: [error],
      });
      return;
    }

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

    const data = await this.find(user.id);
    const member = await this.agent.fetchMemberFromInteraction(interaction);
    if (!data) {
      await this.replyNotFound({ member }, interaction, user.id);
      return;
    }

    await this.actionsManager.executeAction(this.action, interaction, data);
  }

  public async autocomplete(
    interaction: AutocompleteInteraction,
  ): Promise<void> {
    await interaction.respond([]);
  }

  public createData(): SlashCommandSubcommandBuilder {
    const option = this.data.options.user;

    return new SlashCommandSubcommandBuilder()
      .setName(this.data.name)
      .setDescription(this.data.description)
      .addUserOption(
        new SlashCommandUserOption()
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(true),
      );
  }

  public allowsNonMembers(): boolean {
    return this.allowNonMembers;
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
