import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { OfferMessagesParser } from '../../message/OfferMessagesParser';

export class OfferNotFoundExecutor implements ServiceActionExecutor<string> {
  protected readonly messages: OfferMessagesParser;

  constructor(messages: OfferMessagesParser) {
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
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
