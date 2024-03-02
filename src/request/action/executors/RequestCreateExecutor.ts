import type { Message } from 'discord.js';
import { nanoid } from 'nanoid';

import type { RequestRepository } from '../../../hermes/database/RequestRepository';
import type { HermesPlaceholderErrorContext } from '../../../hermes/message/context/HermesPlaceholderErrorContext';
import type { TransactionClient } from '../../../prisma/TransactionClient';
import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { RequestCreateData } from '../../../service/request/RequestCreateData';
import type { RequestData } from '../../../service/request/RequestData';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { RequestPlaceholderContext } from '../../message/placeholder/RequestPlaceholderContext';
import type { RequestMessagesParser } from '../../message/RequestMessagesParser';

export class RequestCreateExecutor
  implements ServiceActionExecutor<RequestCreateData>
{
  protected readonly messages: RequestMessagesParser;

  protected readonly repository: RequestRepository;

  protected readonly agent: DiscordRequestAgent;

  constructor(
    messages: RequestMessagesParser,
    repository: RequestRepository,
    agent: DiscordRequestAgent,
  ) {
    this.messages = messages;
    this.repository = repository;
    this.agent = agent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    request: RequestCreateData,
  ): Promise<void> {
    if (!interaction.replied || interaction.isCommand()) {
      await interaction.deferReply({ ephemeral: true });
    } else {
      await interaction.editReply({ components: [] });
    }

    const { user } = interaction;
    const context = { user };

    const prisma = this.repository.getPrisma();
    let newRequest: RequestData | undefined;
    let message: Message | undefined;

    try {
      await prisma.$transaction(async (tx: TransactionClient) => {
        newRequest = await tx.request.create({
          data: {
            ...request,
            tagId: undefined,
            tag: {
              connect: {
                id: request.tagId,
              },
            },

            channelId: '',
            messageId: '',
            guildId: '',
          },
          include: {
            tag: true,
          },
        });

        message = await this.agent.postRequest(user, newRequest);
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

      await interaction.editReply({ embeds: [errors.user] });
      await this.agent.postError(errors.log);
    }

    const newContext: RequestPlaceholderContext = {
      ...context,
      services: {
        request: newRequest as RequestData,
      },
    };

    await interaction.editReply({
      embeds: [this.messages.getCreateSuccessEmbed(newContext)],
    });
  }
}
