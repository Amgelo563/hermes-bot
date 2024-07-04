import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesRequirement } from '../../hermes/requirement/HermesRequirement';
import type { RequirementResultData } from '../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../requirement/result/RequirementResultEnum';
import type { DiscordServiceAgent } from '../../service/discord/DiscordServiceAgent';
import type { BlacklistMessagesParser } from '../message/read/BlacklistMessagesParser';
import type { BlacklistRepository } from '../repository/BlacklistRepository';

export class BlacklistRequirement implements HermesRequirement<unknown> {
  protected readonly parser: BlacklistMessagesParser;

  protected readonly repository: BlacklistRepository;

  protected readonly agent: DiscordServiceAgent;

  constructor(
    parser: BlacklistMessagesParser,
    repository: BlacklistRepository,
    agent: DiscordServiceAgent,
  ) {
    this.parser = parser;
    this.repository = repository;
    this.agent = agent;
  }

  public async check(
    context: HermesPlaceholderContext,
  ): Promise<RequirementResultData> {
    const { member } = context;

    const blacklist = await this.repository.find(member.id);
    if (!blacklist) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    const blacklister =
      (await this.agent.fetchMember(blacklist.createdBy))
      ?? this.agent.getUnknownMember(blacklist.createdBy);

    const blacklistContext = {
      ...context,
      blacklist: {
        ...blacklist,
        blacklister,
        blacklisted: member,
      },
    };

    return {
      allowed: RequirementResultEnum.Deny,
      message: this.parser.getBlacklistRequirementEmbed(blacklistContext),
    };
  }
}
