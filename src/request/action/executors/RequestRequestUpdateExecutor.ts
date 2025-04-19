import type { NyxBot } from '@nyx-discord/core';

import { RequestUpdateSession } from '../../../bot/request/sessions/RequestUpdateSession';
import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagRepository } from '../../../tag/database/TagRepository';
import type { RequestDataWithMember } from '../../data/RequestDataWithMember';
import type { RequestRepository } from '../../database/RequestRepository';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
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

  protected readonly tagRepository: TagRepository;

  constructor(
    bot: NyxBot,
    repository: RequestRepository,
    modalCodec: RequestModalCodec,
    messages: HermesMessageService,
    requirements: RequestRequirementsChecker,
    actions: RequestActionsManager,
    config: HermesConfigWrapper,
    tagRepository: TagRepository,
  ) {
    this.bot = bot;
    this.repository = repository;
    this.modalCodec = modalCodec;
    this.messages = messages;
    this.requirements = requirements;
    this.actions = actions;
    this.config = config;
    this.tagRepository = tagRepository;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordRequestAgent,
    request: RequestDataWithMember,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const hermesMember = await agent.fetchMemberFromInteraction(interaction);
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

    const tags = request.tag ? [request.tag] : this.tagRepository.getTags();
    const session = new RequestUpdateSession(
      this.bot,
      interaction,
      request,
      this.messages,
      this.modalCodec,
      this.requirements,
      this.actions,
      hermesMember,
      tags,
    );

    await this.bot.getSessionManager().start(session);
  }
}
