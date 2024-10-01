import type { NyxLogger } from '@nyx-discord/core';
import { Bot } from '@nyx-discord/framework';
import { Client, IntentsBitField } from 'discord.js';

import { BotManager } from './bot/BotManager';
import type { HermesConfigWrapper } from './config/file/HermesConfigWrapper';
import type { HermesDatabaseService } from './hermes/database/HermesDatabaseService';
import type { HermesMessageService } from './hermes/message/HermesMessageService';
import { ServiceManager } from './service/ServiceManager';
import { StickyMessagesDomain } from './sticky/StickyMessagesDomain';

export class HermesService {
  protected readonly logger: NyxLogger;

  protected readonly config: HermesConfigWrapper;

  protected readonly databaseService: HermesDatabaseService;

  protected readonly messageService: HermesMessageService;

  protected readonly serviceManager: ServiceManager;

  protected readonly botManager: BotManager;

  protected readonly stickyDomain: StickyMessagesDomain | null;

  constructor(
    logger: NyxLogger,
    config: HermesConfigWrapper,
    database: HermesDatabaseService,
    messages: HermesMessageService,
    services: ServiceManager,
    botManager: BotManager,
    sticky: StickyMessagesDomain | null,
  ) {
    this.logger = logger;
    this.botManager = botManager;
    this.config = config;
    this.databaseService = database;
    this.serviceManager = services;
    this.messageService = messages;
    this.stickyDomain = sticky;
  }

  public static create(
    logger: NyxLogger,
    config: HermesConfigWrapper,
    messages: HermesMessageService,
    database: HermesDatabaseService,
    deployCommands: boolean,
  ): HermesService {
    const client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
      ],
      allowedMentions: {
        parse: ['users'],
      },
    });
    const rawConfig = config.getConfig();

    const bot = Bot.create(() => ({
      client,
      token: rawConfig.discord.token,
      id: Symbol('HermesBot'),
      logger,
      deployCommands,
    }));

    const serviceManager = ServiceManager.create(
      bot,
      database,
      client,
      messages,
      config,
    );

    const stickyMessagesDomain =
      rawConfig.offer.stickyMessage.send || rawConfig.request.stickyMessage.send
        ? StickyMessagesDomain.create(
            messages,
            bot,
            config.getConfig(),
            database,
          )
        : null;

    const botManager = BotManager.create(
      serviceManager,
      messages,
      bot,
      config,
      serviceManager.getErrorAgent(),
      stickyMessagesDomain,
    );

    return new HermesService(
      logger,
      config,
      database,
      messages,
      serviceManager,
      botManager,
      stickyMessagesDomain,
    );
  }

  public async start(): Promise<this> {
    await this.botManager.start();
    await this.serviceManager.start();

    if (this.stickyDomain !== null) {
      await this.stickyDomain.start();
    }

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
