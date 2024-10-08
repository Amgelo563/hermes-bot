import { IllegalStateError } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesErrorAgent } from '../../../error/HermesErrorAgent';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { OfferDataWithMember } from '../../data/OfferDataWithMember';
import type { OfferRepository } from '../../database/OfferRepository';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferMessagesParser } from '../../message/read/OfferMessagesParser';
import type { OfferActionExecutor } from './OfferActionExecutor';

export class OfferUpdateExecutor implements OfferActionExecutor {
  protected readonly repository: OfferRepository;

  protected readonly messages: OfferMessagesParser;

  protected readonly errorAgent: HermesErrorAgent;

  constructor(
    repository: OfferRepository,
    messages: OfferMessagesParser,
    errorAgent: HermesErrorAgent,
  ) {
    this.repository = repository;
    this.messages = messages;
    this.errorAgent = errorAgent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordOfferAgent,
    offer: OfferDataWithMember,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const currentOffer = await this.repository.find(offer.id);
    if (!currentOffer) {
      throw new IllegalStateError();
    }

    const newOffer = {
      ...offer,
      getId: undefined,
    };

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
      services: {
        offer,
      },
    };

    const dbOffer = { ...newOffer, member: undefined };
    try {
      await this.repository.update(offer.id, dbOffer);
      await agent.refreshOffer(newOffer);
      await agent.postUpdateLog(interaction.user.id, newOffer, {
        ...currentOffer,
        member: newOffer.member,
      });
    } catch (error) {
      const errorContext = {
        ...context,
        error: {
          instance: error as Error,
          id: nanoid(5),
        },
      };

      const errorEmbeds = this.messages.getUpdateErrorEmbeds(errorContext);
      await this.errorAgent.consumeWithErrorEmbeds(
        error,
        errorEmbeds,
        interaction,
      );

      return;
    }

    const success = this.messages.getUpdateSuccessEmbed(context);
    await interaction.editReply({ embeds: [success], components: [] });
  }
}
