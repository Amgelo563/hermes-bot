import type { NyxBot } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import type { OfferRepository } from '../../../hermes/database/OfferRepository';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { OfferData } from '../../../service/offer/OfferData';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferMessagesParser } from '../../message/OfferMessagesParser';
import type { OfferRequirementsChecker } from '../../requirement/OfferRequirementsChecker';
import type { OfferActionExecutor } from './OfferActionExecutor';

export class OfferRepostExecutor implements OfferActionExecutor {
  protected readonly bot: NyxBot;

  protected readonly requirements: OfferRequirementsChecker;

  protected readonly messages: OfferMessagesParser;

  protected readonly agent: DiscordOfferAgent;

  protected readonly repository: OfferRepository;

  constructor(
    bot: NyxBot,
    messages: OfferMessagesParser,
    requirements: OfferRequirementsChecker,
    agent: DiscordOfferAgent,
    repository: OfferRepository,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.requirements = requirements;
    this.agent = agent;
    this.repository = repository;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    member: HermesMember,
    offer: OfferData,
  ): Promise<void> {
    const context = {
      member,
      services: {
        offer,
      },
    };

    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const confirmed = await this.requirements.checkRepostAndHandle(
      context,
      offer,
      interaction,
      member,
    );
    if (!confirmed) return;

    try {
      const newPostMessage = await this.agent.repostOffer(offer);
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
      await this.agent.postError(errorEmbeds.log);
      return;
    }

    await interaction.editReply({
      embeds: [this.messages.getRepostSuccessEmbed(context)],
    });
  }
}
