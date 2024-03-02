import type { NyxBot } from '@nyx-discord/core';
import type { Client } from 'discord.js';
import type { HermesConfigWrapper } from '../config/HermesConfigWrapper';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import { CommandPlaceholderReplacer } from '../hermes/message/placeholder/CommandPlaceholderReplacer';
import type { ServiceManager } from '../service/ServiceManager';
import { BotOfferManager } from './offer/BotOfferManager';
import { BotRequestManager } from './request/BotRequestManager';
import { BotTagManager } from './tag/BotTagManager';

/** Manages objects that connect the bot with the {@link ServiceManager}. */
export class BotManager {
  protected readonly messages: HermesMessageService;

  protected readonly bot: NyxBot;

  protected readonly tag: BotTagManager;

  protected readonly request: BotRequestManager;

  protected readonly offer: BotOfferManager;

  constructor(
    messages: HermesMessageService,
    bot: NyxBot,
    tag: BotTagManager,
    request: BotRequestManager,
    offer: BotOfferManager,
  ) {
    this.messages = messages;
    this.bot = bot;
    this.tag = tag;
    this.request = request;
    this.offer = offer;
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
      services.getRequestDomain(),
      services.getTagDomain().getRepository(),
    );
    const offer = BotOfferManager.create(
      bot,
      messages,
      services.getOfferDomain(),
      services.getTagDomain().getRepository(),
    );

    return new BotManager(messages, bot, tag, request, offer);
  }

  public async start(): Promise<void> {
    const replacer = CommandPlaceholderReplacer.fromBot(this.bot);
    this.messages.getPlaceholderManager().addReplacer(replacer);

    await this.bot.start();
    await this.tag.start();
    await this.request.start();
    await this.offer.start();
  }

  public getBot(): NyxBot {
    return this.bot;
  }

  public getClient(): Client {
    return this.bot.client;
  }
}
