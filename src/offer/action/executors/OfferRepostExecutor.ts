import type { NyxBot } from '@nyx-discord/core';
import { nanoid } from 'nanoid';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { OfferData } from '../../data/OfferData';

import type { OfferRepository } from '../../database/OfferRepository';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferMessagesParser } from '../../message/read/OfferMessagesParser';
import type { OfferRequirementsChecker } from '../../requirement/OfferRequirementsChecker';
import type { OfferActionExecutor } from './OfferActionExecutor';

export class OfferRepostExecutor implements OfferActionExecutor {
  protected readonly bot: NyxBot;

  protected readonly requirements: OfferRequirementsChecker;

  protected readonly messages: OfferMessagesParser;

  protected readonly repository: OfferRepository;

  constructor(
    bot: NyxBot,
    messages: OfferMessagesParser,
    requirements: OfferRequirementsChecker,
    repository: OfferRepository,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.requirements = requirements;
    this.repository = repository;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordOfferAgent,
    offer: OfferData,
  ): Promise<void> {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
      services: {
        offer,
      },
    };

    const confirmed = await this.requirements.checkRepostAndHandle(
      context,
      offer,
      interaction,
      member,
    );
    if (!confirmed) return;

    try {
      const newPostMessage = await agent.repostOffer(offer);
      await this.repository.updateRepost(offer.id, newPostMessage);
    } catch (error) {
      const errorContext = {
        ...context,
        error: {
          instance: error as Error,
          id: nanoid(5),
        },
      };

      const errorEmbeds = this.messages.getRepostErrorEmbeds(errorContext);

      await interaction.editReply({ embeds: [errorEmbeds.user] });
      await agent.postError(errorEmbeds.log);
      return;
    }

    await interaction.editReply({
      embeds: [this.messages.getRepostSuccessEmbed(context)],
    });
  }
}
