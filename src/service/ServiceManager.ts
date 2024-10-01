import type { NyxBot } from '@nyx-discord/core';
import type { Client } from 'discord.js';

import { BlacklistDomain } from '../blacklist/BlacklistDomain';
import type { HermesConfigWrapper } from '../config/file/HermesConfigWrapper';
import { HermesErrorAgent } from '../error/HermesErrorAgent';
import type { HermesDatabaseService } from '../hermes/database/HermesDatabaseService';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import { OfferDomain } from '../offer/OfferDomain';
import { RequestDomain } from '../request/RequestDomain';
import { TagDomain } from '../tag/TagDomain';
import { DiscordServiceAgent } from './discord/DiscordServiceAgent';

/** Manages the main service objects (request, offer, tag domains). */
export class ServiceManager {
  protected readonly agent: DiscordServiceAgent;

  protected readonly errorAgent: HermesErrorAgent;

  protected readonly database: HermesDatabaseService;

  protected readonly requestDomain: RequestDomain;

  protected readonly offerDomain: OfferDomain;

  protected readonly tagDomain: TagDomain;

  protected readonly blacklistDomain: BlacklistDomain;

  constructor(
    database: HermesDatabaseService,
    agent: DiscordServiceAgent,
    errorAgent: HermesErrorAgent,
    request: RequestDomain,
    offer: OfferDomain,
    tagDomain: TagDomain,
    blacklist: BlacklistDomain,
  ) {
    this.database = database;
    this.agent = agent;
    this.errorAgent = errorAgent;
    this.requestDomain = request;
    this.offerDomain = offer;
    this.tagDomain = tagDomain;
    this.blacklistDomain = blacklist;
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
    const errorAgent = HermesErrorAgent.create(bot, serviceAgent);

    const request = RequestDomain.create(
      bot,
      configWrapper,
      database,
      messages,
      errorAgent,
    );
    const offer = OfferDomain.create(
      bot,
      configWrapper,
      database,
      messages,
      errorAgent,
    );
    const tag = TagDomain.create(
      bot,
      configWrapper,
      database,
      messages,
      errorAgent,
    );
    const blacklist = BlacklistDomain.create(
      bot,
      configWrapper,
      database,
      messages,
      errorAgent,
    );

    return new ServiceManager(
      database,
      serviceAgent,
      errorAgent,
      request,
      offer,
      tag,
      blacklist,
    );
  }

  public async start() {
    this.agent.start();
    this.errorAgent.start();

    this.requestDomain.start();
    this.offerDomain.start();
    this.blacklistDomain.start();
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

  public getBlacklistDomain() {
    return this.blacklistDomain;
  }

  public getErrorAgent() {
    return this.errorAgent;
  }
}
