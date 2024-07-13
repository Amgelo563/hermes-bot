import type { NyxBot } from '@nyx-discord/core';
import type { Client } from 'discord.js';
import type { HermesConfigWrapper } from '../config/file/HermesConfigWrapper';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import type { DiscordServiceAgent } from '../service/discord/DiscordServiceAgent';
import type { ServiceManager } from '../service/ServiceManager';
import { BotBlacklistManager } from './blacklist/BotBlacklistManager';
import { BotCommandPlaceholderReplacer } from './message/BotCommandPlaceholderReplacer';
import { NonMemberActionSubCommandMiddleware } from './middleware/NonMemberActionSubCommandMiddleware';
import { BotOfferManager } from './offer/BotOfferManager';
import { BotRequestManager } from './request/BotRequestManager';
import { BotTagManager } from './tag/BotTagManager';

/** Manages objects that connect the bot with the {@link ServiceManager}. */
export class BotManager {
  protected readonly messages: HermesMessageService;

  protected readonly bot: NyxBot;

  protected readonly discordAgent: DiscordServiceAgent;

  protected readonly tag: BotTagManager;

  protected readonly request: BotRequestManager;

  protected readonly offer: BotOfferManager;

  protected readonly blacklist: BotBlacklistManager;

  constructor(
    messages: HermesMessageService,
    bot: NyxBot,
    discordAgent: DiscordServiceAgent,
    tag: BotTagManager,
    request: BotRequestManager,
    offer: BotOfferManager,
    blacklist: BotBlacklistManager,
  ) {
    this.messages = messages;
    this.bot = bot;
    this.tag = tag;
    this.request = request;
    this.offer = offer;
    this.blacklist = blacklist;
    this.discordAgent = discordAgent;
  }

  public static create(
    services: ServiceManager,
    messages: HermesMessageService,
    bot: NyxBot,
    config: HermesConfigWrapper,
  ) {
    const tag = BotTagManager.create(
      bot,
      messages,
      services.getTagDomain(),
      config,
    );
    const request = BotRequestManager.create(
      bot,
      messages,
      config,
      services.getRequestDomain(),
      services.getTagDomain().getRepository(),
    );
    const offer = BotOfferManager.create(
      bot,
      messages,
      config,
      services.getOfferDomain(),
      services.getTagDomain().getRepository(),
    );
    const blacklist = BotBlacklistManager.create(
      bot,
      messages,
      config,
      services.getBlacklistDomain(),
    );

    return new BotManager(
      messages,
      bot,
      services.getServiceAgent(),
      tag,
      request,
      offer,
      blacklist,
    );
  }

  public async start(): Promise<void> {
    const middleware = new NonMemberActionSubCommandMiddleware(
      this.messages.getGeneralMessages(),
      this.discordAgent,
    );
    this.bot.getCommandManager().getExecutor().getMiddleware().add(middleware);

    await this.tag.start();
    await this.request.start();
    await this.offer.start();
    await this.blacklist.start();

    await this.bot.start();
    const replacer = await BotCommandPlaceholderReplacer.fromBot(this.bot);
    this.messages.getPlaceholderManager().addReplacer(replacer);
  }

  public getBot(): NyxBot {
    return this.bot;
  }

  public getClient(): Client {
    return this.bot.getClient();
  }
}
