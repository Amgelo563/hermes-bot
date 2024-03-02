import type { NyxBot } from '@nyx-discord/core';
import type { Guild } from 'discord.js';
import type { HermesConfigWrapper } from '../config/HermesConfigWrapper';
import type { TagRepository } from '../hermes/database/TagRepository';
import type { HermesDatabaseService } from '../hermes/HermesDatabaseService';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import { TagActionsManager } from './action/TagActionsManager';
import type { TagConfig } from './config/TagConfigSchema';
import { DiscordTagAgent } from './discord/DiscordTagAgent';
import type { TagMessagesParser } from './message/TagMessagesParser';
import { TagModalCodec } from './modal/TagModalCodec';

export class TagDomain {
  protected readonly tagConfig: TagConfig;

  protected readonly messages: TagMessagesParser;

  protected readonly actions: TagActionsManager;

  protected readonly modalCodec: TagModalCodec;

  protected readonly repository: TagRepository;

  protected readonly tagAgent: DiscordTagAgent;

  constructor(
    tagConfig: TagConfig,
    messages: TagMessagesParser,
    actions: TagActionsManager,
    modalCodec: TagModalCodec,
    repository: TagRepository,
    tagAgent: DiscordTagAgent,
  ) {
    this.tagConfig = tagConfig;
    this.messages = messages;
    this.actions = actions;
    this.modalCodec = modalCodec;
    this.repository = repository;
    this.tagAgent = tagAgent;
  }

  public static create(
    bot: NyxBot,
    configWrapper: HermesConfigWrapper,
    database: HermesDatabaseService,
    messagesService: HermesMessageService,
  ): TagDomain {
    const messages = messagesService.getTagsMessages();
    const tagAgent = DiscordTagAgent.create(
      messages,
      configWrapper.getConfig(),
    );

    const modalData = messages.getCreateModal();
    const modalCodec = new TagModalCodec(modalData);

    const actions = TagActionsManager.create(
      bot,
      configWrapper,
      messagesService,
      database.getTagRepository(),
      modalCodec,
      tagAgent,
    );

    const repository = database.getTagRepository();

    return new TagDomain(
      configWrapper.getConfig().tags,
      messages,
      actions,
      modalCodec,
      repository,
      tagAgent,
    );
  }

  public async start(guild: Guild) {
    this.tagAgent.start(guild);
    const tags = await this.repository.findAll();

    if (tags.length === 0) {
      for (const tag of this.tagConfig.defaultTags) {
        await this.repository.create(tag);
      }
    }
  }

  public getModalCodec(): TagModalCodec {
    return this.modalCodec;
  }

  public getMessages(): TagMessagesParser {
    return this.messages;
  }

  public getActions(): TagActionsManager {
    return this.actions;
  }

  public getRepository(): TagRepository {
    return this.repository;
  }

  public getTagAgent(): DiscordTagAgent {
    return this.tagAgent;
  }
}
