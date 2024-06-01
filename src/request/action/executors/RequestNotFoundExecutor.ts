import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { RequestMessagesParser } from '../../message/RequestMessagesParser';

export class RequestNotFoundExecutor implements ServiceActionExecutor<string> {
  protected readonly messages: RequestMessagesParser;

  constructor(messages: RequestMessagesParser) {
    this.messages = messages;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    member: HermesMember,
    id: string,
  ): Promise<void> {
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
