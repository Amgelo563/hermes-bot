import type { CommandExecutionMeta, ParentCommand } from '@nyx-discord/core';
import { IllegalStateError, ObjectNotFoundError } from '@nyx-discord/core';
import { AbstractSubCommand } from '@nyx-discord/framework';
import type {
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import {
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from 'discord.js';
import parseDuration from 'parse-duration';

import type { BlacklistActionsManager } from '../../../blacklist/action/BlacklistActionsManager';
import type { BlacklistCreateData } from '../../../blacklist/data/BlacklistCreateData';
import type { DiscordBlacklistAgent } from '../../../blacklist/discord/DiscordBlacklistAgent';
import type { BlacklistMessagesParser } from '../../../blacklist/message/read/BlacklistMessagesParser';
import type { BlacklistModalCodec } from '../../../blacklist/modal/BlacklistModalCodec';
import type { BlacklistRepository } from '../../../blacklist/repository/BlacklistRepository';
import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';

export class BlacklistCreateSubCommand extends AbstractSubCommand {
  protected static readonly BlacklistedIndex = 0;

  protected readonly data: CommandSchemaType<'user'>;

  protected readonly optionName: string;

  protected readonly actions: BlacklistActionsManager;

  protected readonly repository: BlacklistRepository;

  protected readonly messages: BlacklistMessagesParser;

  protected readonly modalCodec: BlacklistModalCodec;

  protected readonly agent: DiscordBlacklistAgent;

  protected readonly config: HermesConfigWrapper;

  constructor(
    parent: ParentCommand,
    data: CommandSchemaType<'user'>,
    config: HermesConfigWrapper,
    agent: DiscordBlacklistAgent,
    messages: BlacklistMessagesParser,
    actions: BlacklistActionsManager,
    repository: BlacklistRepository,
    modalCodec: BlacklistModalCodec,
  ) {
    super(parent);
    this.data = data;
    this.optionName = data.options.user.name;
    this.actions = actions;
    this.repository = repository;
    this.messages = messages;
    this.modalCodec = modalCodec;
    this.agent = agent;
    this.config = config;
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
    meta: CommandExecutionMeta,
  ): Promise<void> {
    if (!interaction.inGuild() || !interaction.inCachedGuild()) {
      const { user } = interaction;
      const member = this.agent.mockMember(user);
      const error = this.messages.getNotAllowedErrorEmbed({ member });
      await interaction.reply({
        ephemeral: true,
        embeds: [error],
      });
      return;
    }

    const member = await this.agent.fetchMemberFromInteraction(interaction);
    if (!this.config.isStaff(member)) {
      const error = this.messages.getNotAllowedErrorEmbed({ member });
      await interaction.reply({
        ephemeral: true,
        embeds: [error],
      });
    }

    const target = interaction.options.getMember(this.optionName);
    if (!target) {
      const error = this.messages.getNotAllowedErrorEmbed({ member });
      await interaction.reply({
        ephemeral: true,
        embeds: [error],
      });
      return;
    }

    const customIdBuilder = this.getCustomIdBuilder(meta.getBot());
    customIdBuilder.setAt(
      BlacklistCreateSubCommand.BlacklistedIndex,
      target.id,
    );
    console.log(customIdBuilder);

    const customId = customIdBuilder.build();
    console.log(customId);

    const modal = this.modalCodec.createModal(customId);
    await interaction.showModal(modal);
  }

  protected async handleModal(
    interaction: ModalSubmitInteraction,
    meta: CommandExecutionMeta,
  ): Promise<void> {
    const bot = meta.getBot();
    const customIdCodec = bot.getCommandManager().getCustomIdCodec();

    const customIdIterator = customIdCodec.createIteratorFromCustomId(
      interaction.customId,
    );
    if (!customIdIterator) {
      throw new IllegalStateError();
    }

    const targetId = customIdIterator.getAt(
      BlacklistCreateSubCommand.BlacklistedIndex,
    );
    if (!targetId) {
      throw new ObjectNotFoundError();
    }
    const modalData = this.modalCodec.extractFromModal(interaction);

    const blacklister =
      await this.agent.fetchMemberFromInteraction(interaction);
    const blacklisted = await this.agent.fetchMember(targetId, true);

    const duration = modalData.time
      ? parseDuration(modalData.time) ?? null
      : null;

    // At least 1 day is required
    const expiresAt =
      duration && duration >= 86_400_000
        ? new Date(Date.now() + duration)
        : null;

    const createData: BlacklistCreateData = {
      blacklisted,
      blacklister,
      reason: modalData.reason,
      expiresAt,
    };

    await this.actions.create(interaction, createData);
  }

  protected createData(): SlashCommandSubcommandBuilder {
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
}
