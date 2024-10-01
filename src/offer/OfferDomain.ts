import type { NyxBot } from '@nyx-discord/core';

import type { HermesConfigWrapper } from '../config/file/HermesConfigWrapper';
import type { HermesErrorAgent } from '../error/HermesErrorAgent';
import type { HermesDatabaseService } from '../hermes/database/HermesDatabaseService';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import { RequirementCheckModeEnum } from '../requirement/mode/RequirementCheckMode';
import { OfferActionsManager } from './action/OfferActionsManager';
import type { OfferConfig } from './config/OfferConfigSchema';
import type { OfferRepository } from './database/OfferRepository';
import { DiscordOfferAgent } from './discord/DiscordOfferAgent';
import type { OfferMessagesParser } from './message/read/OfferMessagesParser';
import { OfferModalCodec } from './modal/OfferModalCodec';
import { OfferRequirementsChecker } from './requirement/OfferRequirementsChecker';

export class OfferDomain {
  protected readonly messages: OfferMessagesParser;

  protected readonly actions: OfferActionsManager;

  protected readonly modalCodec: OfferModalCodec;

  protected readonly config: OfferConfig;

  protected readonly requirements: OfferRequirementsChecker;

  protected readonly offerAgent: DiscordOfferAgent;

  protected readonly repository: OfferRepository;

  constructor(
    config: OfferConfig,
    messages: OfferMessagesParser,
    actions: OfferActionsManager,
    modalCodec: OfferModalCodec,
    requirements: OfferRequirementsChecker,
    offerAgent: DiscordOfferAgent,
    repository: OfferRepository,
  ) {
    this.config = config;
    this.messages = messages;
    this.actions = actions;
    this.modalCodec = modalCodec;
    this.requirements = requirements;
    this.offerAgent = offerAgent;
    this.repository = repository;
  }

  public static create(
    bot: NyxBot,
    configWrapper: HermesConfigWrapper,
    database: HermesDatabaseService,
    messagesService: HermesMessageService,
    errorAgent: HermesErrorAgent,
  ): OfferDomain {
    const messages = messagesService.getOfferMessages();

    const modalData = messages.getCreateModal();
    const modalCodec = new OfferModalCodec(modalData);

    const discordAgent = DiscordOfferAgent.create(
      bot.getClient(),
      messagesService,
      configWrapper.getConfig(),
    );

    const requirements = OfferRequirementsChecker.create(
      bot,
      configWrapper,
      messagesService,
      database,
      discordAgent,
    );

    const actions = OfferActionsManager.create(
      bot,
      configWrapper,
      database.getOfferRepository(),
      modalCodec,
      messagesService,
      requirements,
      discordAgent,
      errorAgent,
    );

    return new OfferDomain(
      configWrapper.getConfig().offer,
      messages,
      actions,
      modalCodec,
      requirements,
      discordAgent,
      database.getOfferRepository(),
    );
  }

  public start() {
    this.offerAgent.start();

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

  public getConfig(): OfferConfig {
    return this.config;
  }

  public getModalCodec(): OfferModalCodec {
    return this.modalCodec;
  }

  public getMessages(): OfferMessagesParser {
    return this.messages;
  }

  public getActions(): OfferActionsManager {
    return this.actions;
  }

  public getRequirements(): OfferRequirementsChecker {
    return this.requirements;
  }

  public getDiscordAgent(): DiscordOfferAgent {
    return this.offerAgent;
  }

  public getRepository(): OfferRepository {
    return this.repository;
  }
}
