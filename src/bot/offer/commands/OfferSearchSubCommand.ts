import type { ParentCommand } from '@nyx-discord/core';
import type { EmbedBuilder } from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { OfferDataWithMember } from '../../../offer/data/OfferDataWithMember';
import type { OfferRepository } from '../../../offer/database/OfferRepository';
import type { DiscordOfferAgent } from '../../../offer/discord/DiscordOfferAgent';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagRepository } from '../../../tag/database/TagRepository';
import { AbstractServiceSearchSubCommand } from '../../search/commands/AbstractServiceSearchSubCommand';

export class OfferSearchSubCommand extends AbstractServiceSearchSubCommand<OfferDataWithMember> {
  protected static readonly OfferLimit = 500;

  protected readonly offerRepository: OfferRepository;

  constructor(
    parent: ParentCommand,
    data: CommandSchemaType,
    repository: TagRepository,
    offerRepository: OfferRepository,
    agent: DiscordOfferAgent,
    messageService: HermesMessageService,
  ) {
    super(parent, data, repository, agent, messageService);
    this.offerRepository = offerRepository;
  }

  protected createEmbed(
    member: HermesMember,
    items: OfferDataWithMember[],
  ): EmbedBuilder {
    return this.messageService
      .getOfferMessages()
      .getSearchEmbed({ member }, items);
  }

  protected async fetch(): Promise<OfferDataWithMember[]> {
    const offers = await this.offerRepository.findAll(
      OfferSearchSubCommand.OfferLimit,
    );
    const withMembers: OfferDataWithMember[] = [];

    for (const offer of offers) {
      const member = await this.agent.fetchMemberOrUnknown(offer.memberId);

      withMembers.push({ ...offer, member });
    }

    return withMembers;
  }
}
