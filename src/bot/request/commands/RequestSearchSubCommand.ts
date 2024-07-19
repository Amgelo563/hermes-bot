import type { ParentCommand } from '@nyx-discord/core';
import type { EmbedBuilder } from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { RequestData } from '../../../request/data/RequestData';
import type { RequestRepository } from '../../../request/database/RequestRepository';
import type { DiscordRequestAgent } from '../../../request/discord/DiscordRequestAgent';
import type { RequestMessagesParser } from '../../../request/message/read/RequestMessagesParser';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagRepository } from '../../../tag/database/TagRepository';
import { AbstractServiceSearchSubCommand } from '../../search/commands/AbstractServiceSearchSubCommand';

export class RequestSearchSubCommand extends AbstractServiceSearchSubCommand<RequestData> {
  protected static readonly RequestLimit = 500;

  protected readonly messages: RequestMessagesParser;

  protected readonly requestRepository: RequestRepository;

  constructor(
    parent: ParentCommand,
    data: CommandSchemaType,
    repository: TagRepository,
    messages: RequestMessagesParser,
    offerRepository: RequestRepository,
    agent: DiscordRequestAgent,
  ) {
    super(parent, data, repository, agent);
    this.messages = messages;
    this.requestRepository = offerRepository;
  }

  protected createEmbed(
    member: HermesMember,
    items: RequestData[],
  ): EmbedBuilder {
    return this.messages.getSearchEmbed({ member }, items);
  }

  protected fetch(): Promise<RequestData[]> {
    return this.requestRepository.findUpTo(
      RequestSearchSubCommand.RequestLimit,
    );
  }
}
