import type { ParentCommand } from '@nyx-discord/core';
import type { EmbedBuilder } from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { RequestData } from '../../../request/data/RequestData';
import type { RequestRepository } from '../../../request/database/RequestRepository';
import type { DiscordRequestAgent } from '../../../request/discord/DiscordRequestAgent';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagRepository } from '../../../tag/database/TagRepository';
import { AbstractServiceSearchSubCommand } from '../../search/commands/AbstractServiceSearchSubCommand';

export class RequestSearchSubCommand extends AbstractServiceSearchSubCommand<RequestData> {
  protected static readonly RequestLimit = 500;

  protected readonly requestRepository: RequestRepository;

  constructor(
    parent: ParentCommand,
    data: CommandSchemaType,
    repository: TagRepository,
    offerRepository: RequestRepository,
    agent: DiscordRequestAgent,
    messageService: HermesMessageService,
  ) {
    super(parent, data, repository, agent, messageService);
    this.requestRepository = offerRepository;
  }

  protected createEmbed(
    member: HermesMember,
    items: RequestData[],
  ): EmbedBuilder {
    return this.messageService
      .getRequestMessages()
      .getSearchEmbed({ member }, items);
  }

  protected fetch(): Promise<RequestData[]> {
    return this.requestRepository.findAll(RequestSearchSubCommand.RequestLimit);
  }
}
