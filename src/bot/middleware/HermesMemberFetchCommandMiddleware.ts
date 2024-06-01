import type {
  CommandData,
  CommandExecutionArgs,
  ExecutableCommand,
  Identifier,
  MiddlewareResponse,
} from '@nyx-discord/core';
import { AbstractCommandMiddleware } from '@nyx-discord/framework';

import type { DiscordServiceAgent } from '../../service/discord/DiscordServiceAgent';

export class HermesMemberFetchCommandMiddleware extends AbstractCommandMiddleware {
  public static readonly Key: Identifier = Symbol('HermesMember');

  protected readonly agent: DiscordServiceAgent;

  constructor(agent: DiscordServiceAgent) {
    super();
    this.agent = agent;
  }

  public async check(
    _checked: ExecutableCommand<CommandData>,
    [interaction, meta]: CommandExecutionArgs,
  ): Promise<MiddlewareResponse> {
    const member = await this.agent.fetchMember(interaction.user.id);
    meta.set(HermesMemberFetchCommandMiddleware.Key, member);

    return this.true();
  }
}
