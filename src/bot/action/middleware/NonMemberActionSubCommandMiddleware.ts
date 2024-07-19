import type {
  AnyExecutableCommand,
  CommandResolvableInteraction,
  MiddlewareResponse,
} from '@nyx-discord/core';
import { AbstractCommandMiddleware } from '@nyx-discord/framework';

import type { GeneralMessagesParser } from '../../../hermes/message/messages/general/GeneralMessagesParser';
import type { DiscordServiceAgent } from '../../../service/discord/DiscordServiceAgent';
import { AbstractActionSubCommand } from '../commands/AbstractActionSubCommand';

export class NonMemberActionSubCommandMiddleware extends AbstractCommandMiddleware {
  protected readonly messages: GeneralMessagesParser;

  protected readonly agent: DiscordServiceAgent;

  constructor(messages: GeneralMessagesParser, agent: DiscordServiceAgent) {
    super();
    this.messages = messages;
    this.agent = agent;
  }

  public async check(
    checked: AnyExecutableCommand,
    interaction: CommandResolvableInteraction,
  ): Promise<MiddlewareResponse> {
    if (interaction.isAutocomplete() || interaction.inGuild()) {
      return this.true();
    }
    if (
      !(checked instanceof AbstractActionSubCommand)
      || checked.allowsNonMembers()
    ) {
      return this.true();
    }

    const member = this.agent.mockMember(interaction.user);
    const embed = this.messages.getNotInGuildErrorEmbed({ member });
    await interaction.reply({ embeds: [embed] });

    return this.false();
  }
}
