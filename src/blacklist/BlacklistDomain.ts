import type { NyxBot } from '@nyx-discord/core';

import type { HermesConfigWrapper } from '../config/file/HermesConfigWrapper';
import type { HermesErrorAgent } from '../error/HermesErrorAgent';
import type { HermesDatabaseService } from '../hermes/database/HermesDatabaseService';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import { BlacklistActionsManager } from './action/BlacklistActionsManager';
import type { BlacklistConfig } from './config/BlacklistConfigSchema';
import { DiscordBlacklistAgent } from './discord/DiscordBlacklistAgent';
import type { BlacklistMessagesParser } from './message/read/BlacklistMessagesParser';
import { BlacklistModalCodec } from './modal/BlacklistModalCodec';
import type { BlacklistRepository } from './repository/BlacklistRepository';

export class BlacklistDomain {
  protected readonly config: BlacklistConfig;

  protected readonly messages: BlacklistMessagesParser;

  protected readonly actions: BlacklistActionsManager;

  protected readonly modalCodec: BlacklistModalCodec;

  protected readonly repository: BlacklistRepository;

  protected readonly agent: DiscordBlacklistAgent;

  constructor(
    config: BlacklistConfig,
    messages: BlacklistMessagesParser,
    actions: BlacklistActionsManager,
    modalCodec: BlacklistModalCodec,
    repository: BlacklistRepository,
    agent: DiscordBlacklistAgent,
  ) {
    this.config = config;
    this.messages = messages;
    this.actions = actions;
    this.modalCodec = modalCodec;
    this.repository = repository;
    this.agent = agent;
  }

  public static create(
    bot: NyxBot,
    configWrapper: HermesConfigWrapper,
    database: HermesDatabaseService,
    messagesService: HermesMessageService,
    errorAgent: HermesErrorAgent,
  ): BlacklistDomain {
    const messages = messagesService.getBlacklistMessages();
    const repository = database.getBlacklistRepository();

    const modalData = messages.getCreateModalData();
    const modalCodec = new BlacklistModalCodec(modalData);

    const discordAgent = DiscordBlacklistAgent.create(
      bot.getClient(),
      messagesService,
      configWrapper.getConfig(),
    );

    const actions = BlacklistActionsManager.create(
      bot,
      messagesService,
      repository,
      discordAgent,
      errorAgent,
    );

    return new BlacklistDomain(
      configWrapper.getConfig().blacklist,
      messages,
      actions,
      modalCodec,
      repository,
      discordAgent,
    );
  }

  public start() {
    this.agent.start();
  }

  public getAgent(): DiscordBlacklistAgent {
    return this.agent;
  }

  public getConfig(): BlacklistConfig {
    return this.config;
  }

  public getMessages(): BlacklistMessagesParser {
    return this.messages;
  }

  public getActions(): BlacklistActionsManager {
    return this.actions;
  }

  public getModalCodec(): BlacklistModalCodec {
    return this.modalCodec;
  }

  public getRepository(): BlacklistRepository {
    return this.repository;
  }
}
