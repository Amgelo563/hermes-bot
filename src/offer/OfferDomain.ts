import type { NyxBot } from '@nyx-discord/core';
import type { Guild } from 'discord.js';
import type { HermesConfigWrapper } from '../config/HermesConfigWrapper';
import type { OfferRepository } from '../hermes/database/OfferRepository';
import type { HermesDatabaseService } from '../hermes/HermesDatabaseService';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import { RequirementCheckModeEnum } from '../requirement/mode/RequirementCheckMode';
import { OfferActionsManager } from './action/OfferActionsManager';
import type { OfferConfig } from './config/OfferConfigSchema';
import { DiscordOfferAgent } from './discord/DiscordOfferAgent';
import type { OfferMessagesParser } from './message/OfferMessagesParser';
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
  ): OfferDomain {
    const messages = messagesService.getOfferMessages();

    const modalData = messages.getCreateModal();
    const modalCodec = new OfferModalCodec(modalData);

    const requirements = OfferRequirementsChecker.create(
      bot,
      messagesService,
      database.getOfferRepository(),
      database.getRequestRepository(),
    );

    const discordAgent = DiscordOfferAgent.create(
      configWrapper.getConfig(),
      messages,
    );

    const actions = OfferActionsManager.create(
      bot,
      configWrapper,
      database.getOfferRepository(),
      modalCodec,
      messagesService,
      requirements,
      discordAgent,
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

  public start(guild: Guild) {
    this.offerAgent.start(guild);

    this.requirements
      .initialize(
        RequirementCheckModeEnum.Publish,
        this.config.requirements.publish,
      )
      .initialize(
        RequirementCheckModeEnum.Repost,
        this.config.requirements.repost,
      )
      .initialize(
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
