import type { Message } from 'discord.js';
import { nanoid } from 'nanoid';

import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesErrorAgent } from '../../../error/HermesErrorAgent';
import type { HermesPlaceholderErrorContext } from '../../../hermes/message/context/HermesPlaceholderErrorContext';
import type { TransactionClient } from '../../../prisma/TransactionClient';
import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { RequestCreateData } from '../../data/RequestCreateData';
import type { RequestData } from '../../data/RequestData';
import type { RequestRepository } from '../../database/RequestRepository';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { RequestPlaceholderContext } from '../../message/placeholder/RequestPlaceholderContext';
import type { RequestMessagesParser } from '../../message/read/RequestMessagesParser';

export class RequestCreateExecutor
  implements ServiceActionExecutor<DiscordRequestAgent, RequestCreateData>
{
  protected readonly messages: RequestMessagesParser;

  protected readonly repository: RequestRepository;

  protected readonly errorAgent: HermesErrorAgent;

  constructor(
    messages: RequestMessagesParser,
    repository: RequestRepository,
    errorAgent: HermesErrorAgent,
  ) {
    this.messages = messages;
    this.repository = repository;
    this.errorAgent = errorAgent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordRequestAgent,
    request: RequestCreateData,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = { member };

    const prisma = this.repository.getPrisma();
    let newRequest: RequestData | undefined;
    let message: Message | undefined;

    const dbRequest = { ...request, member: undefined };
    try {
      await prisma.$transaction(async (tx: TransactionClient) => {
        newRequest = await tx.request.create({
          data: {
            ...dbRequest,
            tagId: undefined,
            tag:
              request.tagId === null
                ? undefined
                : { connect: { id: request.tagId } },

            channelId: '',
            messageId: '',
            guildId: '',
          },
          include: {
            tag: true,
          },
        });

        message = await agent.postRequest(member, { ...newRequest, member });
        const channelId: string = message.channel.id;
        const messageId: string = message.id;
        const guildId: string = message.guildId!;

        await tx.request.update({
          where: {
            id: newRequest.id,
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
      const errorContext = {
        ...context,
        error: {
          instance: error,
          id: nanoid(5),
        },
      } satisfies HermesPlaceholderErrorContext;

      const errors = this.messages.getCreateErrorEmbeds(errorContext);

      await this.errorAgent.consumeWithErrorEmbeds(e, errors, interaction);

      return;
    }

    const newContext: RequestPlaceholderContext = {
      ...context,
      services: {
        request: { ...(newRequest as RequestData), member },
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
