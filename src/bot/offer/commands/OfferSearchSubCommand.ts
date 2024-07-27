import type { ParentCommand } from '@nyx-discord/core';
import type { EmbedBuilder } from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { OfferData } from '../../../offer/data/OfferData';
import type { OfferRepository } from '../../../offer/database/OfferRepository';
import type { DiscordOfferAgent } from '../../../offer/discord/DiscordOfferAgent';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagRepository } from '../../../tag/database/TagRepository';
import { AbstractServiceSearchSubCommand } from '../../search/commands/AbstractServiceSearchSubCommand';

export class OfferSearchSubCommand extends AbstractServiceSearchSubCommand<OfferData> {
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
    items: OfferData[],
  ): EmbedBuilder {
    return this.messageService
      .getOfferMessages()
      .getSearchEmbed({ member }, items);
  }

  protected fetch(): Promise<OfferData[]> {
    return this.offerRepository.findAll(OfferSearchSubCommand.OfferLimit);
  }
}
