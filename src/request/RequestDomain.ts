import type { NyxBot } from '@nyx-discord/core';

import type { HermesConfigWrapper } from '../config/file/HermesConfigWrapper';
import type { HermesErrorAgent } from '../error/HermesErrorAgent';
import type { HermesDatabaseService } from '../hermes/database/HermesDatabaseService';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import { RequirementCheckModeEnum } from '../requirement/mode/RequirementCheckMode';
import { RequestActionsManager } from './action/RequestActionsManager';
import type { RequestConfig } from './config/RequestConfigSchema';
import type { RequestRepository } from './database/RequestRepository';
import { DiscordRequestAgent } from './discord/DiscordRequestAgent';
import type { RequestMessagesParser } from './message/read/RequestMessagesParser';
import { RequestModalCodec } from './modal/RequestModalCodec';
import { RequestRequirementsChecker } from './requirement/RequestRequirementsChecker';

/** Facade for all request related objects. */
export class RequestDomain {
  protected readonly messages: RequestMessagesParser;

  protected readonly actions: RequestActionsManager;

  protected readonly modalCodec: RequestModalCodec;

  protected readonly config: RequestConfig;

  protected readonly requirements: RequestRequirementsChecker;

  protected readonly discordAgent: DiscordRequestAgent;

  protected readonly repository: RequestRepository;

  constructor(
    config: RequestConfig,
    messages: RequestMessagesParser,
    actions: RequestActionsManager,
    modalCodec: RequestModalCodec,
    requirements: RequestRequirementsChecker,
    discordAgent: DiscordRequestAgent,
    repository: RequestRepository,
  ) {
    this.config = config;
    this.messages = messages;
    this.actions = actions;
    this.modalCodec = modalCodec;
    this.requirements = requirements;
    this.discordAgent = discordAgent;
    this.repository = repository;
  }

  public static create(
    bot: NyxBot,
    configWrapper: HermesConfigWrapper,
    database: HermesDatabaseService,
    messagesService: HermesMessageService,
    errorAgent: HermesErrorAgent,
  ): RequestDomain {
    const messages = messagesService.getRequestMessages();

    const modalData = messages.getCreateModal();
    const modalCodec = new RequestModalCodec(modalData);

    const config = configWrapper.getConfig();
    const requestAgent = DiscordRequestAgent.create(
      bot.getClient(),
      messagesService,
      config,
    );

    const requirements = RequestRequirementsChecker.create(
      bot,
      configWrapper,
      messagesService,
      database,
      requestAgent,
    );

    const actions = RequestActionsManager.create(
      bot,
      messagesService,
      configWrapper,
      database.getRequestRepository(),
      requestAgent,
      modalCodec,
      requirements,
      database.getTagRepository(),
      errorAgent,
    );

    return new RequestDomain(
      config.request,
      messages,
      actions,
      modalCodec,
      requirements,
      requestAgent,
      database.getRequestRepository(),
    );
  }

  public start() {
    this.discordAgent.start();
    this.requirements
      .setupFromConfigs(
        RequirementCheckModeEnum.Publish,
        this.config.requirements.publish,
      )
      .setupFromConfigs(
        RequirementCheckModeEnum.Repost,
        this.config.requirements.repost,
      )
      .setupFromConfigs(
        RequirementCheckModeEnum.Update,
        this.config.requirements.update,
      );
  }

  public getConfig(): RequestConfig {
    return this.config;
  }

  public getModalCodec(): RequestModalCodec {
    return this.modalCodec;
  }

  public getRequirements(): RequestRequirementsChecker {
    return this.requirements;
  }

  public getMessages(): RequestMessagesParser {
    return this.messages;
  }

  public getActions(): RequestActionsManager {
    return this.actions;
  }

  public getDiscordAgent(): DiscordRequestAgent {
    return this.discordAgent;
  }

  public getRepository(): RequestRepository {
    return this.repository;
  }
}
