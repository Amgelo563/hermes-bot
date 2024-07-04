import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { DiscordBlacklistAgent } from '../../discord/DiscordBlacklistAgent';
import type { IdentifiableBlacklist } from '../../identity/IdentifiableBlacklist';
import type { BlacklistMessagesParser } from '../../message/read/BlacklistMessagesParser';
import type { BlacklistActionExecutor } from './BlacklistActionExecutor';

export class BlacklistInfoExecutor implements BlacklistActionExecutor {
  protected readonly messages: BlacklistMessagesParser;

  constructor(messages: BlacklistMessagesParser) {
    this.messages = messages;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordBlacklistAgent,
    data: IdentifiableBlacklist,
  ): Promise<void> {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const member = await agent.fetchMemberFromInteraction(interaction);
    const blacklisted =
      (await agent.fetchMember(data.id)) ?? agent.getUnknownMember(data.id);
    const blacklister =
      (await agent.fetchMember(data.createdBy))
      ?? agent.getUnknownMember(data.id);

    const context = {
      member,
      blacklist: {
        ...data,
        blacklisted,
        blacklister,
      },
    };

    const embed = this.messages.getInfoEmbed(context);

    await interaction.editReply({ embeds: [embed] });
  }
}
