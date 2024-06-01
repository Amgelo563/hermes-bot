import type { Message } from 'discord.js';
import { nanoid } from 'nanoid';

import type { OfferRepository } from '../../../hermes/database/OfferRepository';
import type { HermesPlaceholderErrorContext } from '../../../hermes/message/context/HermesPlaceholderErrorContext';
import type { TransactionClient } from '../../../prisma/TransactionClient';
import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { OfferCreateData } from '../../../service/offer/OfferCreateData';
import type { OfferData } from '../../../service/offer/OfferData';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferMessagesParser } from '../../message/OfferMessagesParser';
import type { OfferPlaceholderContext } from '../../message/placeholder/OfferPlaceholderContext';

export class OfferCreateExecutor
  implements ServiceActionExecutor<OfferCreateData>
{
  protected readonly messages: OfferMessagesParser;

  protected readonly repository: OfferRepository;

  protected readonly agent: DiscordOfferAgent;

  constructor(
    messages: OfferMessagesParser,
    repository: OfferRepository,
    agent: DiscordOfferAgent,
  ) {
    this.messages = messages;
    this.repository = repository;
    this.agent = agent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    member: HermesMember,
    offer: OfferCreateData,
  ): Promise<void> {
    if (!interaction.replied || interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: true });
    } else {
      await interaction.editReply({ components: [] });
    }

    const context = { member };

    const prisma = this.repository.getPrisma();
    let message: Message | undefined;
    let newOffer: OfferData | undefined;

    try {
      await prisma.$transaction(async (tx: TransactionClient) => {
        const newOffer = await tx.offer.create({
          data: {
            ...offer,

            tags: {
              connect: offer.tags.map((tag) => ({
                id: tag.id,
              })),
            },

            channelId: '',
            messageId: '',
            guildId: '',
          },
        });

        const postOffer = {
          ...newOffer,
          tags: offer.tags,
        };

        message = await this.agent.postOffer(member, postOffer);
        const channelId: string = message.channel.id;
        const messageId: string = message.id;
        const guildId: string = message.guildId!;

        await tx.offer.update({
          where: {
            id: newOffer.id,
          },
          data: {
            channelId,
            messageId,
            guildId,
          },
        });
      });
    } catch (e) {
      let error = e as Error;

      if (message) {
        await message.delete().catch((deleteError) => {
          error = new AggregateError([deleteError, error]);
        });
      }
      const errorContext: HermesPlaceholderErrorContext = {
        ...context,
        error: {
          instance: error,
          id: nanoid(5),
        },
      };

      const errors = this.messages.getCreateErrorEmbeds(errorContext);

      await interaction.editReply({ embeds: [errors.user] });
      await this.agent.postError(errors.log);

      return;
    }

    const newContext: OfferPlaceholderContext = {
      ...context,
      services: {
        offer: newOffer as OfferData,
      },
    };

    await interaction.editReply({
      embeds: [this.messages.getCreateSuccessEmbed(newContext)],
    });
  }
}
