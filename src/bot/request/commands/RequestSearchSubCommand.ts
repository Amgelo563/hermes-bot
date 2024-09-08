import type { ParentCommand } from '@nyx-discord/core';
import type { EmbedBuilder } from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { RequestDataWithMember } from '../../../request/data/RequestDataWithMember';
import type { RequestRepository } from '../../../request/database/RequestRepository';
import type { DiscordRequestAgent } from '../../../request/discord/DiscordRequestAgent';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagRepository } from '../../../tag/database/TagRepository';
import { AbstractServiceSearchSubCommand } from '../../search/commands/AbstractServiceSearchSubCommand';

// eslint-disable-next-line max-len
export class RequestSearchSubCommand extends AbstractServiceSearchSubCommand<RequestDataWithMember> {
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
    items: RequestDataWithMember[],
  ): EmbedBuilder {
    return this.messageService
      .getRequestMessages()
      .getSearchEmbed({ member }, items);
  }

  protected async fetch(): Promise<RequestDataWithMember[]> {
    const requests = await this.requestRepository.findAll(
      RequestSearchSubCommand.RequestLimit,
    );
    const withMembers: RequestDataWithMember[] = [];

    for (const request of requests) {
      const member = await this.agent.fetchMemberOrUnknown(request.memberId);

      withMembers.push({ ...request, member });
    }

    return withMembers;
  }
}
