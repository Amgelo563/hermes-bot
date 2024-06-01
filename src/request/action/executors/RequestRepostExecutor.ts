import type { NyxBot } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import type { RequestRepository } from '../../../hermes/database/RequestRepository';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { RequestData } from '../../../service/request/RequestData';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { RequestMessagesParser } from '../../message/RequestMessagesParser';
import type { RequestRequirementsChecker } from '../../requirement/RequestRequirementsChecker';
import type { RequestActionExecutor } from './RequestActionExecutor';

export class RequestRepostExecutor implements RequestActionExecutor {
  protected readonly bot: NyxBot;

  protected readonly requirements: RequestRequirementsChecker;

  protected readonly requestMessages: RequestMessagesParser;

  protected readonly agent: DiscordRequestAgent;

  protected readonly repository: RequestRepository;

  constructor(
    bot: NyxBot,
    requestMessages: RequestMessagesParser,
    requirements: RequestRequirementsChecker,
    agent: DiscordRequestAgent,
    repository: RequestRepository,
  ) {
    this.bot = bot;
    this.requestMessages = requestMessages;
    this.requirements = requirements;
    this.agent = agent;
    this.repository = repository;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    member: HermesMember,
    request: RequestData,
  ): Promise<void> {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const context = {
      member,
      services: {
        request,
      },
    };
    const confirmed = await this.requirements.checkRepostAndHandle(
      context,
      request,
      interaction,
      member,
    );
    if (!confirmed) return;

    try {
      const newPostMessage = await this.agent.repostRequest(request);
      await this.repository.updateRepost(request.id, newPostMessage);
    } catch (error) {
      const errorContext = {
        ...context,
        error: {
          instance: error as Error,
          id: nanoid(5),
        },
      };

      const errorEmbeds =
        this.requestMessages.getRepostErrorEmbeds(errorContext);

      await interaction.editReply({ embeds: [errorEmbeds.user] });
      await this.agent.postError(errorEmbeds.log);
      return;
    }

    await interaction.editReply({
      embeds: [this.requestMessages.getRepostSuccessEmbed(context)],
    });
  }
}
