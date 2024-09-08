import type { Message } from 'discord.js';
import { nanoid } from 'nanoid';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesPlaceholderErrorContext } from '../../../hermes/message/context/HermesPlaceholderErrorContext';
import type { TransactionClient } from '../../../prisma/TransactionClient';
import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { OfferCreateData } from '../../data/OfferCreateData';
import type { OfferData } from '../../data/OfferData';

import type { OfferRepository } from '../../database/OfferRepository';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferPlaceholderContext } from '../../message/placeholder/OfferPlaceholderContext';
import type { OfferMessagesParser } from '../../message/read/OfferMessagesParser';

export class OfferCreateExecutor
  implements ServiceActionExecutor<DiscordOfferAgent, OfferCreateData>
{
  protected readonly messages: OfferMessagesParser;

  protected readonly repository: OfferRepository;

  constructor(messages: OfferMessagesParser, repository: OfferRepository) {
    this.messages = messages;
    this.repository = repository;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordOfferAgent,
    offer: OfferCreateData,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const member = await agent.fetchMemberFromInteraction(interaction);
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
          member: offer.member,
          tags: offer.tags,
        };

        message = await agent.postOffer(member, postOffer);
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
      await agent.postError(errors.log);

      return;
    }

    const newContext: OfferPlaceholderContext = {
      ...context,
      services: {
        offer: { ...newOffer!, member: offer.member },
      },
    };

    await interaction.editReply({
      embeds: [this.messages.getCreateSuccessEmbed(newContext)],
    });
  }

  public async defer(interaction: ServiceActionInteraction): Promise<void> {
    if (!interaction.replied || interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: true });
    } else {
      await interaction.editReply({ components: [] });
    }
  }
}
