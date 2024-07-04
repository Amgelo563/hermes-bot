import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferMessagesParser } from '../../message/read/OfferMessagesParser';

export class OfferNotFoundExecutor
  implements ServiceActionExecutor<DiscordOfferAgent, string>
{
  protected readonly messages: OfferMessagesParser;

  constructor(messages: OfferMessagesParser) {
    this.messages = messages;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordOfferAgent,
    id: string,
  ): Promise<void> {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
    };
    const embed = this.messages.getNotFoundErrorEmbed(context, id);
    await interaction.editReply({ embeds: [embed] });
  }
}
