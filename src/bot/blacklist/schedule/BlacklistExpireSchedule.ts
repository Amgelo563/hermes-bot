import type { ScheduleTickMeta } from '@nyx-discord/core';
import { AbstractSchedule } from '@nyx-discord/framework';
import { nanoid } from 'nanoid';

import type { DiscordBlacklistAgent } from '../../../blacklist/discord/DiscordBlacklistAgent';
import type { BlacklistPlaceholderContext } from '../../../blacklist/message/placeholder/BlacklistPlaceholderContext';
import type { BlacklistMessagesParser } from '../../../blacklist/message/read/BlacklistMessagesParser';
import type { BlacklistRepository } from '../../../blacklist/repository/BlacklistRepository';
import type { HermesErrorAgent } from '../../../error/HermesErrorAgent';
import type { WithRequired } from '../../../types/WithRequired';

export class BlacklistExpireSchedule extends AbstractSchedule {
  // Every 1 hour
  protected readonly interval = '0 */1 * * * *';

  protected readonly repository: BlacklistRepository;

  protected readonly agent: DiscordBlacklistAgent;

  protected readonly messages: BlacklistMessagesParser;

  protected readonly errorAgent: HermesErrorAgent;

  constructor(
    repository: BlacklistRepository,
    agent: DiscordBlacklistAgent,
    messages: BlacklistMessagesParser,
    errorAgent: HermesErrorAgent,
  ) {
    super();
    this.repository = repository;
    this.agent = agent;
    this.messages = messages;
    this.errorAgent = errorAgent;
  }

  public async tick(meta: ScheduleTickMeta): Promise<void> {
    const bot = meta.getBot();
    const client = bot.getClient();
    if (!client.user) return;

    const member = this.agent.getOwnMember();
    const blacklists = await this.repository.findAllExpired();

    const promises = blacklists.map(async (blacklist) => {
      try {
        await this.repository.delete(blacklist.id);
        await this.agent.logBlacklistExpire(member, blacklist);
      } catch (e) {
        const blacklister =
          (await this.agent.fetchMember(blacklist.createdBy))
          ?? this.agent.getUnknownMember(blacklist.createdBy);
        const blacklisted =
          (await this.agent.fetchMember(blacklist.id))
          ?? this.agent.getUnknownMember(blacklist.createdBy);

        const errorContext: WithRequired<BlacklistPlaceholderContext, 'error'> =
          {
            member,
            error: {
              instance: e as Error,
              id: nanoid(5),
            },
            blacklist: {
              ...blacklist,
              blacklister,
              blacklisted,
            },
          };

        const errorEmbed = this.messages.getExpireErrorEmbed(errorContext);
        await this.errorAgent.consumeWithLogEmbed(e, errorEmbed);

        return;
      }
    });

    await Promise.all(promises);
  }
}
