import type { CommandExecutionMeta, ParentCommand } from '@nyx-discord/core';
import { AbstractSubCommand } from '@nyx-discord/framework';
import type { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { DiscordServiceAgent } from '../../../service/discord/DiscordServiceAgent';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagRepository } from '../../../tag/database/TagRepository';
import type { FilterableService } from '../sessions/filter/FilterableService';
import { ServiceSearchSession } from '../sessions/ServiceSearchSession';

export abstract class AbstractServiceSearchSubCommand<
  Item extends FilterableService,
> extends AbstractSubCommand {
  protected readonly data: CommandSchemaType;

  protected readonly repository: TagRepository;

  protected readonly agent: DiscordServiceAgent;

  protected readonly messageService: HermesMessageService;

  constructor(
    parent: ParentCommand,
    data: CommandSchemaType,
    repository: TagRepository,
    agent: DiscordServiceAgent,
    messageService: HermesMessageService,
  ) {
    super(parent);
    this.data = data;
    this.repository = repository;
    this.agent = agent;
    this.messageService = messageService;
  }

  public createData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName(this.data.name)
      .setDescription(this.data.description);
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
    metadata: CommandExecutionMeta,
  ): Promise<void> {
    const bot = metadata.getBot();
    const items = await this.fetch();
    const tags = this.repository.getTags();
    const member = await this.agent.fetchMemberFromInteraction(interaction);

    const session = ServiceSearchSession.create(
      bot,
      interaction,
      member,
      items,
      tags,
      this.createEmbed.bind(this, member),
      this.messageService.getGeneralMessages(),
      this.messageService.getTagsMessages(),
    );

    await session.start();
  }

  protected abstract fetch(): Promise<Item[]>;

  protected abstract createEmbed(
    member: HermesMember,
    items: Item[],
  ): EmbedBuilder;
}
