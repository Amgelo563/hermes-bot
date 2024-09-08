import { IllegalStateError } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { OfferDataWithMember } from '../../data/OfferDataWithMember';
import type { OfferRepository } from '../../database/OfferRepository';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferMessagesParser } from '../../message/read/OfferMessagesParser';
import type { OfferActionExecutor } from './OfferActionExecutor';

export class OfferUpdateExecutor implements OfferActionExecutor {
  protected readonly repository: OfferRepository;

  protected readonly messages: OfferMessagesParser;

  constructor(repository: OfferRepository, messages: OfferMessagesParser) {
    this.repository = repository;
    this.messages = messages;
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

    try {
      await this.repository.update(offer.id, newOffer);
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
      await interaction.editReply({ embeds: [errorEmbeds.user] });
      await agent.postError(errorEmbeds.log);

      return;
    }

    const success = this.messages.getUpdateSuccessEmbed(context);
    await interaction.editReply({ embeds: [success], components: [] });
  }
}
