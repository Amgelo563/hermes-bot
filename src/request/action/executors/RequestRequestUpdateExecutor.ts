import type { NyxBot } from '@nyx-discord/core';

import { RequestUpdateSession } from '../../../bot/request/sessions/RequestUpdateSession';
import type { HermesConfigWrapper } from '../../../config/HermesConfigWrapper';
import type { RequestRepository } from '../../../hermes/database/RequestRepository';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { RequestData } from '../../../service/request/RequestData';
import type { RequestModalCodec } from '../../modal/RequestModalCodec';
import type { RequestRequirementsChecker } from '../../requirement/RequestRequirementsChecker';
import type { RequestActionsManager } from '../RequestActionsManager';
import type { RequestActionExecutor } from './RequestActionExecutor';

export class RequestRequestUpdateExecutor implements RequestActionExecutor {
  protected readonly modalCodec: RequestModalCodec;

  protected readonly repository: RequestRepository;

  protected readonly messages: HermesMessageService;

  protected readonly actions: RequestActionsManager;

  protected readonly requirements: RequestRequirementsChecker;

  protected readonly bot: NyxBot;

  protected readonly config: HermesConfigWrapper;

  constructor(
    bot: NyxBot,
    repository: RequestRepository,
    modalCodec: RequestModalCodec,
    messages: HermesMessageService,
    requirements: RequestRequirementsChecker,
    actions: RequestActionsManager,
    config: HermesConfigWrapper,
  ) {
    this.bot = bot;
    this.repository = repository;
    this.modalCodec = modalCodec;
    this.messages = messages;
    this.requirements = requirements;
    this.actions = actions;
    this.config = config;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    hermesMember: HermesMember,
    request: RequestData,
  ): Promise<void> {
    const context = {
      member: hermesMember,
      services: { request },
    };

    if (!this.config.canEditRequest(hermesMember, request)) {
      const notFound = this.messages
        .getRequestMessages()
        .getNotFoundErrorEmbed(context, request.id.toString());

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [notFound] });
        return;
      }

      await interaction.reply({ embeds: [notFound], ephemeral: true });
    }

    const session = new RequestUpdateSession(
      this.bot,
      interaction,
      request,
      this.messages,
      this.modalCodec,
      this.requirements,
      this.actions,
      hermesMember,
    );

    await this.bot.sessions.start(session);
  }
}
