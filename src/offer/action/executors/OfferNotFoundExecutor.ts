import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { OfferMessagesParser } from '../../message/OfferMessagesParser';

export class OfferNotFoundExecutor implements ServiceActionExecutor<string> {
  protected readonly messages: OfferMessagesParser;

  constructor(messages: OfferMessagesParser) {
    this.messages = messages;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    id: string,
  ): Promise<void> {
    const context = {
      user: interaction.user,
    };
    const embed = this.messages.getNotFoundErrorEmbed(context, id);
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
