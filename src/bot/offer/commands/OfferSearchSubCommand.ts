import type { ParentCommand } from '@nyx-discord/core';
import type { EmbedBuilder } from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { OfferData } from '../../../offer/data/OfferData';
import type { OfferRepository } from '../../../offer/database/OfferRepository';
import type { DiscordOfferAgent } from '../../../offer/discord/DiscordOfferAgent';
import type { OfferMessagesParser } from '../../../offer/message/read/OfferMessagesParser';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagRepository } from '../../../tag/database/TagRepository';
import { AbstractServiceSearchSubCommand } from '../../search/commands/AbstractServiceSearchSubCommand';

export class OfferSearchSubCommand extends AbstractServiceSearchSubCommand<OfferData> {
  protected static readonly OfferLimit = 500;

  protected readonly messages: OfferMessagesParser;

  protected readonly offerRepository: OfferRepository;

  constructor(
    parent: ParentCommand,
    data: CommandSchemaType,
    repository: TagRepository,
    messages: OfferMessagesParser,
    offerRepository: OfferRepository,
    agent: DiscordOfferAgent,
  ) {
    super(parent, data, repository, agent);
    this.messages = messages;
    this.offerRepository = offerRepository;
  }

  protected createEmbed(
    member: HermesMember,
    items: OfferData[],
  ): EmbedBuilder {
    return this.messages.getSearchEmbed({ member }, items);
  }

  protected fetch(): Promise<OfferData[]> {
    return this.offerRepository.findUpTo(OfferSearchSubCommand.OfferLimit);
  }
}
