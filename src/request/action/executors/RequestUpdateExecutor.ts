import { IllegalStateError } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import type { RequestRepository } from '../../../hermes/database/RequestRepository';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { RequestMessagesParser } from '../../message/RequestMessagesParser';
import type { IdentifiableRequest } from '../identity/IdentifiableRequest';
import type { RequestActionExecutor } from './RequestActionExecutor';

export class RequestUpdateExecutor implements RequestActionExecutor {
  protected readonly repository: RequestRepository;

  protected readonly agent: DiscordRequestAgent;

  protected readonly messages: RequestMessagesParser;

  constructor(
    repository: RequestRepository,
    messages: RequestMessagesParser,
    agent: DiscordRequestAgent,
  ) {
    this.repository = repository;
    this.messages = messages;
    this.agent = agent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    request: IdentifiableRequest,
  ): Promise<void> {
    if (!interaction.replied && !interaction.deferred) {
      if (interaction.isChatInputCommand()) {
        await interaction.deferReply({ ephemeral: true });
      } else {
        await interaction.deferUpdate();
      }
    }

    const currentRequest = await this.repository.find(request.id);
    if (!currentRequest) {
      throw new IllegalStateError();
    }

    const newRequest = {
      ...request,
      getId: undefined,
    };

    const context = {
      user: interaction.user,
      services: {
        request,
      },
    };

    try {
      await this.repository.update(request.id, newRequest);
      await this.agent.refreshRequest(newRequest);
      await this.agent.postUpdateLog(
        interaction.user,
        newRequest,
        currentRequest,
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
