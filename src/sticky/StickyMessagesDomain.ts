import type { NyxBot } from '@nyx-discord/core';
import { ObjectNotFoundError } from '@nyx-discord/core';
import type { Message, MessageCreateOptions } from 'discord.js';

import type { HermesConfig } from '../config/file/HermesConfigSchema';
import type { HermesDatabaseService } from '../hermes/database/HermesDatabaseService';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import { StickyMessagesDiscordAgent } from './agent/StickyMessagesDiscordAgent';
import type { StickyMessageCreateData } from './data/StickyMessageCreateData';
import type { StickyMessageIdType } from './identity/StickyMessagesIds';
import { StickyMessageIdEnum } from './identity/StickyMessagesIds';
import type { StickyMessagesRepository } from './repository/StickyMessagesRepository';

export class StickyMessagesDomain {
  protected readonly agent: StickyMessagesDiscordAgent;

  protected readonly repository: StickyMessagesRepository;

  protected readonly config: HermesConfig;

  protected readonly messageService: HermesMessageService;

  constructor(
    agent: StickyMessagesDiscordAgent,
    repository: StickyMessagesRepository,
    config: HermesConfig,
    messageService: HermesMessageService,
  ) {
    this.agent = agent;
    this.repository = repository;
    this.config = config;
    this.messageService = messageService;
  }

  public static create(
    messages: HermesMessageService,
    bot: NyxBot,
    config: HermesConfig,
    database: HermesDatabaseService,
  ): StickyMessagesDomain {
    const agent = StickyMessagesDiscordAgent.create(
      bot.getClient(),
      messages,
      config,
    );

    return new StickyMessagesDomain(
      agent,
      database.getStickyRepository(),
      config,
      messages,
    );
  }

  public async start(): Promise<void> {
    await this.repository.start();
    this.agent.start();

    for (const type of Object.values(StickyMessageIdEnum)) {
      if (!this.config[type].stickyMessage.send) continue;

      await this.refreshSticky(type, true);
    }
  }

  public async refreshSticky(
    type: StickyMessageIdType,
    editIfPresent: boolean,
  ): Promise<Message | null> {
    const options = this.getMessageOptions(type);
    const newData = this.getDataForType(type);
    const old = await this.repository.find(type);

    const newMessage = await this.agent.updateSticky(
      old,
      newData,
      options,
      editIfPresent,
    );
    if (!newMessage) return null;

    await this.repository.create({
      ...newData,
      messageId: newMessage.id,
    });

    return newMessage;
  }

  protected getMessageOptions(type: StickyMessageIdType): MessageCreateOptions {
    const member = this.agent.getOwnMember();

    switch (type) {
      case StickyMessageIdEnum.Offer:
        return this.messageService
          .getOfferMessages()
          .getStickyMessage({ member });

      case StickyMessageIdEnum.Request:
        return this.messageService
          .getRequestMessages()
          .getStickyMessage({ member });

      default:
        throw new ObjectNotFoundError(
          "Couldn't find options for unknown sticky message type: "
            + String(type),
        );
    }
  }

  protected getDataForType(type: StickyMessageIdType): StickyMessageCreateData {
    const guildId = this.agent.getGuild().id;

    switch (type) {
      case StickyMessageIdEnum.Offer:
        return {
          guildId: guildId,
          channelId: this.config.offer.channel,
          id: type,
        };

      case StickyMessageIdEnum.Request:
        return {
          guildId: guildId,
          channelId: this.config.request.channel,
          id: type,
        };

      default:
        throw new ObjectNotFoundError(
          "Couldn't create data for unknown sticky message type: "
            + String(type),
        );
    }
  }
}
