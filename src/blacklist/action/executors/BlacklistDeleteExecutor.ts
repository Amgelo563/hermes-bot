import { nanoid } from 'nanoid';

import type { HermesErrorAgent } from '../../../error/HermesErrorAgent';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { WithRequired } from '../../../types/WithRequired';
import type { DiscordBlacklistAgent } from '../../discord/DiscordBlacklistAgent';
import type { IdentifiableBlacklist } from '../../identity/IdentifiableBlacklist';
import type { BlacklistPlaceholderContext } from '../../message/placeholder/BlacklistPlaceholderContext';
import type { BlacklistMessagesParser } from '../../message/read/BlacklistMessagesParser';
import type { BlacklistRepository } from '../../repository/BlacklistRepository';
import type { BlacklistActionExecutor } from './BlacklistActionExecutor';

export class BlacklistDeleteExecutor implements BlacklistActionExecutor {
  protected readonly messages: BlacklistMessagesParser;

  protected readonly repository: BlacklistRepository;

  protected readonly errorAgent: HermesErrorAgent;

  constructor(
    messages: BlacklistMessagesParser,
    repository: BlacklistRepository,
    errorAgent: HermesErrorAgent,
  ) {
    this.messages = messages;
    this.repository = repository;
    this.errorAgent = errorAgent;
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

    try {
      await this.repository.delete(data.id);
    } catch (e) {
      const errorContext: WithRequired<BlacklistPlaceholderContext, 'error'> = {
        ...context,
        error: {
          instance: e as Error,
          id: nanoid(5),
        },
      };

      const errorEmbeds = this.messages.getDeleteErrorEmbeds(errorContext);
      await this.errorAgent.consumeWithErrorEmbeds(
        e as object,
        errorEmbeds,
        interaction,
      );

      return;
    }

    const successEmbed = this.messages.getDeleteSuccessEmbed(context);
    await interaction.editReply({ embeds: [successEmbed] });

    await agent.logBlacklistDelete(blacklister, blacklisted, data);
  }

  public async defer(interaction: ServiceActionInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
  }
}
