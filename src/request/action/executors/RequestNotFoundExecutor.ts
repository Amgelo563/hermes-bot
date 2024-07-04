import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { RequestMessagesParser } from '../../message/read/RequestMessagesParser';

export class RequestNotFoundExecutor
  implements ServiceActionExecutor<DiscordRequestAgent, string>
{
  protected readonly messages: RequestMessagesParser;

  constructor(messages: RequestMessagesParser) {
    this.messages = messages;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordRequestAgent,
    id: string,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
    };

    const embed = this.messages.getNotFoundErrorEmbed(context, id);
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [embed], components: [] });
    } else {
      await interaction.reply({
        embeds: [embed],
        components: [],
        ephemeral: true,
      });
    }
  }
}
