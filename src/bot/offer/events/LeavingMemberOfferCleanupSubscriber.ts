import type { EventDispatchMeta } from '@nyx-discord/core';
import { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { GuildMember } from 'discord.js';
import { Events } from 'discord.js';
import type { OfferRepository } from '../../../offer/database/OfferRepository';
import type { DiscordOfferAgent } from '../../../offer/discord/DiscordOfferAgent';

// eslint-disable-next-line max-len
export class LeavingMemberOfferCleanupSubscriber extends AbstractDJSClientSubscriber<Events.GuildMemberRemove> {
  public readonly event = Events.GuildMemberRemove;

  protected readonly repository: OfferRepository;

  protected readonly agent: DiscordOfferAgent;

  constructor(repository: OfferRepository, agent: DiscordOfferAgent) {
    super();
    this.repository = repository;
    this.agent = agent;
  }

  public async handleEvent(
    _meta: EventDispatchMeta,
    member: GuildMember,
  ): Promise<void> {
    if (member.user.bot) {
      return;
    }

    const deleted = await this.repository.deleteByMemberId(member.id);
    if (deleted.length === 0) {
      return;
    }

    const promises = deleted.map(async (offer) => {
      await this.agent.deleteOffer(offer);
      const member = await this.agent.fetchMember(offer.memberId, true);
      await this.agent.postDeleteLog(this.agent.getOwnMember(), {
        ...offer,
        member,
      });
    });
    await Promise.all(promises);
  }
}
