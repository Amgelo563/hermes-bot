import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagMessagesParser } from '../../message/TagMessagesParser';

export class TagNotFoundExecutor implements ServiceActionExecutor<string> {
  protected readonly messages: TagMessagesParser;

  constructor(messages: TagMessagesParser) {
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
