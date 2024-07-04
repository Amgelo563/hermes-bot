import type {
  CommandExecutionMeta,
  ParentCommand,
  SubCommandData,
} from '@nyx-discord/core';
import { AbstractSubCommand } from '@nyx-discord/framework';
import type { ChatInputCommandInteraction } from 'discord.js';

import type { DiscordBlacklistAgent } from '../../../blacklist/discord/DiscordBlacklistAgent';
import type { BlacklistRepository } from '../../../blacklist/repository/BlacklistRepository';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import { BlacklistListSession } from '../sessions/BlacklistListSession';

export class BlacklistListSubCommand extends AbstractSubCommand {
  protected readonly data: SubCommandData;

  protected readonly repository: BlacklistRepository;

  protected readonly agent: DiscordBlacklistAgent;

  protected readonly messages: HermesMessageService;

  constructor(
    parent: ParentCommand,
    data: SubCommandData,
    repository: BlacklistRepository,
    agent: DiscordBlacklistAgent,
    messages: HermesMessageService,
  ) {
    super(parent);
    this.data = data;
    this.repository = repository;
    this.agent = agent;
    this.messages = messages;
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
    metadata: CommandExecutionMeta,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const bot = metadata.getBot();
    const blacklists = await this.repository.findAll();
    const member = await this.agent.fetchMemberFromInteraction(interaction);
    const blacklistMessages = this.messages.getBlacklistMessages();
    const generalMessages = this.messages.getGeneralMessages();

    const session = new BlacklistListSession(
      bot,
      interaction,
      blacklists,
      member,
      blacklistMessages,
      generalMessages,
      this.agent,
    );

    await bot.sessions.start(session);
  }
}
