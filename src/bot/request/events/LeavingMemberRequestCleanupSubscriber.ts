import type { EventDispatchMeta } from '@nyx-discord/core';
import { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { GuildMember } from 'discord.js';
import { Events } from 'discord.js';
import type { RequestRepository } from '../../../request/database/RequestRepository';
import type { DiscordRequestAgent } from '../../../request/discord/DiscordRequestAgent';

// eslint-disable-next-line max-len
export class LeavingMemberRequestCleanupSubscriber extends AbstractDJSClientSubscriber<Events.GuildMemberRemove> {
  public readonly event = Events.GuildMemberRemove;

  protected readonly repository: RequestRepository;

  protected readonly agent: DiscordRequestAgent;

  constructor(repository: RequestRepository, agent: DiscordRequestAgent) {
    super();
    this.repository = repository;
    this.agent = agent;
  }

  public async handleEvent(
    _meta: EventDispatchMeta,
    member: GuildMember,
  ): Promise<void> {
    if (member.user.bot) return;

    const deleted = await this.repository.deleteByMemberId(member.id);
    if (deleted.length === 0) {
      return;
    }

    const promises = deleted.map(async (offer) => {
      await this.agent.deleteRequest(offer);
      const member = await this.agent.fetchMember(offer.memberId, true);
      await this.agent.postDeleteLog(this.agent.getOwnMember(), {
        ...offer,
        member,
      });
    });
    await Promise.all(promises);
  }
}
