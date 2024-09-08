import { IllegalStateError } from '@nyx-discord/core';
import { nanoid } from 'nanoid';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';

import type { RequestRepository } from '../../database/RequestRepository';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { IdentifiableRequest } from '../../identity/IdentifiableRequest';
import type { RequestMessagesParser } from '../../message/read/RequestMessagesParser';
import type { RequestActionExecutor } from './RequestActionExecutor';

export class RequestUpdateExecutor implements RequestActionExecutor {
  protected readonly repository: RequestRepository;

  protected readonly messages: RequestMessagesParser;

  constructor(repository: RequestRepository, messages: RequestMessagesParser) {
    this.repository = repository;
    this.messages = messages;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordRequestAgent,
    request: IdentifiableRequest,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const currentRequest = await this.repository.find(request.id);
    if (!currentRequest) {
      throw new IllegalStateError();
    }

    const newRequest = {
      ...request,
      getId: undefined,
    };

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
      services: {
        request,
      },
    };

    try {
      await this.repository.update(request.id, newRequest);
      await agent.refreshRequest(newRequest);
      await agent.postUpdateLog(member, newRequest, {
        ...currentRequest,
        member,
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

  public async defer(interaction: ServiceActionInteraction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      await interaction.deferReply({ ephemeral: true });
    } else {
      await interaction.deferUpdate();
    }
  }
}
