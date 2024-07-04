import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { DiscordBlacklistAgent } from '../../discord/DiscordBlacklistAgent';
import type { BlacklistMessagesParser } from '../../message/read/BlacklistMessagesParser';

export class BlacklistNotFoundExecutor
  implements ServiceActionExecutor<DiscordBlacklistAgent, string>
{
  protected readonly messages: BlacklistMessagesParser;

  constructor(messages: BlacklistMessagesParser) {
    this.messages = messages;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordBlacklistAgent,
    id: string,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
    };
    const embed = this.messages.getNotBlacklistedEmbed(context, id);
    await interaction.editReply({ embeds: [embed] });
  }
}
