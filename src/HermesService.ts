import type { Logger as NyxLogger } from '@nyx-discord/core';
import { Bot } from '@nyx-discord/framework';
import { Client, IntentsBitField } from 'discord.js';

import { BotManager } from './bot/BotManager';
import type { HermesConfigWrapper } from './config/HermesConfigWrapper';
import type { HermesDatabaseService } from './hermes/HermesDatabaseService';
import type { HermesMessageService } from './hermes/message/HermesMessageService';
import { ServiceManager } from './service/ServiceManager';

export class HermesService {
  protected readonly logger: NyxLogger;

  protected readonly config: HermesConfigWrapper;

  protected readonly databaseService: HermesDatabaseService;

  protected readonly messageService: HermesMessageService;

  protected readonly serviceManager: ServiceManager;

  protected readonly botManager: BotManager;

  constructor(
    logger: NyxLogger,
    config: HermesConfigWrapper,
    database: HermesDatabaseService,
    messages: HermesMessageService,
    services: ServiceManager,
    botManager: BotManager,
  ) {
    this.logger = logger;
    this.botManager = botManager;
    this.config = config;
    this.databaseService = database;
    this.serviceManager = services;
    this.messageService = messages;
  }

  public static create(
    logger: NyxLogger,
    config: HermesConfigWrapper,
    messages: HermesMessageService,
    database: HermesDatabaseService,
  ): HermesService {
    const client = new Client({
      intents: [IntentsBitField.Flags.Guilds],
      allowedMentions: {
        parse: ['users'],
      },
    });
    const bot = Bot.create(() => ({
      client,
      token: config.getConfig().discord.token,
      id: Symbol('HermesBot'),
      logger,
    }));

    const serviceManager = ServiceManager.create(
      bot,
      database,
      client,
      messages,
      config,
    );

    const botManager = BotManager.create(serviceManager, messages, bot, config);

    return new HermesService(
      logger,
      config,
      database,
      messages,
      serviceManager,
      botManager,
    );
  }

  public async start(): Promise<this> {
    await this.botManager.start();
    await this.serviceManager.start();

    return this;
  }

  public getLogger(): NyxLogger {
    return this.logger;
  }

  public getBotManager(): BotManager {
    return this.botManager;
  }

  public getConfig(): HermesConfigWrapper {
    return this.config;
  }

  public getDatabase(): HermesDatabaseService {
    return this.databaseService;
  }

  public getMessages(): HermesMessageService {
    return this.messageService;
  }

  public getServices(): ServiceManager {
    return this.serviceManager;
  }
}
