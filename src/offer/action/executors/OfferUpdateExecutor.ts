import { IllegalStateError } from '@nyx-discord/core';
import { nanoid } from 'nanoid';
import type { OfferRepository } from '../../../hermes/database/OfferRepository';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { OfferData } from '../../../service/offer/OfferData';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferMessagesParser } from '../../message/OfferMessagesParser';
import type { OfferActionExecutor } from './OfferActionExecutor';

export class OfferUpdateExecutor implements OfferActionExecutor {
  protected readonly repository: OfferRepository;

  protected readonly agent: DiscordOfferAgent;

  protected readonly messages: OfferMessagesParser;

  constructor(
    repository: OfferRepository,
    messages: OfferMessagesParser,
    agent: DiscordOfferAgent,
  ) {
    this.repository = repository;
    this.messages = messages;
    this.agent = agent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    member: HermesMember,
    offer: OfferData,
  ): Promise<void> {
    if (!interaction.replied && !interaction.deferred) {
      if (interaction.isChatInputCommand()) {
        await interaction.deferReply({ ephemeral: true });
      } else {
        await interaction.deferUpdate();
      }
    }

    const currentOffer = await this.repository.find(offer.id);
    if (!currentOffer) {
      throw new IllegalStateError();
    }

    const newOffer = {
      ...offer,
      getId: undefined,
    };

    const context = {
      member,
      services: {
        offer,
      },
    };

    try {
      await this.repository.update(offer.id, newOffer);
      await this.agent.refreshOffer(newOffer);
      await this.agent.postUpdateLog(
        interaction.user.id,
        newOffer,
        currentOffer,
      );
    } catch (error) {
      const errorContext = {
        ...context,
        error: {
          instance: error as Error,
          id: nanoid(5),
        },
      };

      const errorEmbeds = this.messages.getUpdateErrorEmbeds(errorContext);
      await interaction.editReply({ embeds: [errorEmbeds.user] });
      await this.agent.postError(errorEmbeds.log);

      return;
    }

    const success = this.messages.getUpdateSuccessEmbed(context);
    await interaction.editReply({ embeds: [success], components: [] });
  }
}
