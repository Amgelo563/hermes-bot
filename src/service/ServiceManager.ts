import type { NyxBot } from '@nyx-discord/core';
import type { Client } from 'discord.js';
import type { HermesConfigWrapper } from '../config/HermesConfigWrapper';
import { HermesBotErrorAgent } from '../error/HermesBotErrorAgent';

import type { HermesDatabaseService } from '../hermes/HermesDatabaseService';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import { OfferDomain } from '../offer/OfferDomain';
import { RequestDomain } from '../request/RequestDomain';
import { TagDomain } from '../tag/TagDomain';
import { DiscordServiceAgent } from './discord/DiscordServiceAgent';

/** Manages the main service objects (request, offer, tag domains). */
export class ServiceManager {
  protected readonly agent: DiscordServiceAgent;

  protected readonly errorAgent: HermesBotErrorAgent;

  protected readonly database: HermesDatabaseService;

  protected readonly requestDomain: RequestDomain;

  protected readonly offerDomain: OfferDomain;

  protected readonly tagDomain: TagDomain;

  constructor(
    database: HermesDatabaseService,
    agent: DiscordServiceAgent,
    errorAgent: HermesBotErrorAgent,
    request: RequestDomain,
    offer: OfferDomain,
    tagDomain: TagDomain,
  ) {
    this.database = database;
    this.agent = agent;
    this.errorAgent = errorAgent;
    this.requestDomain = request;
    this.offerDomain = offer;
    this.tagDomain = tagDomain;
  }

  public static create(
    bot: NyxBot,
    database: HermesDatabaseService,
    client: Client,
    messages: HermesMessageService,
    configWrapper: HermesConfigWrapper,
  ) {
    const serviceAgent = DiscordServiceAgent.create(
      client,
      messages,
      configWrapper.getConfig(),
    );
    const errorAgent = HermesBotErrorAgent.create(bot, serviceAgent);
    const request = RequestDomain.create(
      bot,
      configWrapper,
      database,
      messages,
    );
    const offer = OfferDomain.create(bot, configWrapper, database, messages);
    const tag = TagDomain.create(bot, configWrapper, database, messages);

    return new ServiceManager(
      database,
      serviceAgent,
      errorAgent,
      request,
      offer,
      tag,
    );
  }

  public async start() {
    this.agent.start();
    this.errorAgent.start();

    this.requestDomain.start();
    this.offerDomain.start();
    await this.tagDomain.start();
  }

  public getServiceAgent() {
    return this.agent;
  }

  public getRequestDomain() {
    return this.requestDomain;
  }

  public getOfferDomain() {
    return this.offerDomain;
  }

  public getTagDomain() {
    return this.tagDomain;
  }
}
