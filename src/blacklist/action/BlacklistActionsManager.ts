import type { NyxBot } from '@nyx-discord/core';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { AbstractActionsManager } from '../../service/action/AbstractActionsManager';
import { ServiceActionsCustomIdCodec } from '../../service/action/codec/ServiceActionsCustomIdCodec';
import { ServiceActionCustomIdBuilder } from '../../service/action/customId/ServiceActionCustomIdBuilder';
import type { ServiceActionExecutor } from '../../service/action/executor/ServiceActionExecutor';
import { ServiceObject } from '../../service/ServiceObject';
import type { BlacklistCreateData } from '../data/BlacklistCreateData';
import type { DiscordBlacklistAgent } from '../discord/DiscordBlacklistAgent';
import type { IdentifiableBlacklist } from '../identity/IdentifiableBlacklist';
import { createIdentifiableBlacklist } from '../identity/IdentifiableBlacklist';
import type { BlacklistRepository } from '../repository/BlacklistRepository';
import type {
  BlacklistActionOptions,
  BlacklistActionType,
} from './BlacklistAction';
import { BlacklistAction } from './BlacklistAction';
import type { BlacklistActionsCustomIdCodec } from './codec/BlacklistActionsCustomIdCodec';
import type { BlacklistActionExecutor } from './executors/BlacklistActionExecutor';
import { BlacklistCreateExecutor } from './executors/BlacklistCreateExecutor';
import { BlacklistDeleteExecutor } from './executors/BlacklistDeleteExecutor';
import { BlacklistInfoExecutor } from './executors/BlacklistInfoExecutor';
import { BlacklistNotFoundExecutor } from './executors/BlacklistNotFoundExecutor';

export class BlacklistActionsManager extends AbstractActionsManager<
  IdentifiableBlacklist,
  BlacklistActionOptions,
  DiscordBlacklistAgent,
  BlacklistCreateData
> {
  protected readonly repository: BlacklistRepository;

  constructor(
    repository: BlacklistRepository,
    codec: BlacklistActionsCustomIdCodec,
    executors: Map<BlacklistActionType, BlacklistActionExecutor>,
    createExecutor: ServiceActionExecutor<
      DiscordBlacklistAgent,
      BlacklistCreateData
    >,
    missingExecutor: ServiceActionExecutor<DiscordBlacklistAgent, string>,
    agent: DiscordBlacklistAgent,
  ) {
    super(codec, executors, createExecutor, missingExecutor, agent);
    this.repository = repository;
  }

  public static create(
    bot: NyxBot,
    messageService: HermesMessageService,
    repository: BlacklistRepository,
    agent: DiscordBlacklistAgent,
  ) {
    const messages = messageService.getBlacklistMessages();
    const codec = ServiceActionsCustomIdCodec.createActions<
      IdentifiableBlacklist,
      BlacklistActionOptions
    >(ServiceObject.enum.Blacklist);
    const executors = new Map<BlacklistActionType, BlacklistActionExecutor>([
      [BlacklistAction.enum.Info, new BlacklistInfoExecutor(messages)],
      [
        BlacklistAction.enum.Delete,
        new BlacklistDeleteExecutor(messages, repository),
      ],
    ]);
    const createExecutor = new BlacklistCreateExecutor(
      bot,
      messageService,
      repository,
    );
    const missingExecutor = new BlacklistNotFoundExecutor(messages);
    return new BlacklistActionsManager(
      repository,
      codec,
      executors,
      createExecutor,
      missingExecutor,
      agent,
    );
  }

  protected createBuilderFromCustomId(
    customId: string,
  ): ServiceActionCustomIdBuilder<BlacklistActionOptions> | null {
    return ServiceActionCustomIdBuilder.fromServiceCustomId<BlacklistActionOptions>(
      customId,
      this.codec.getSeparator(),
      this.codec.getDataSeparator(),
      BlacklistAction,
      ServiceObject.enum.Blacklist,
    );
  }

  protected override parseId(id: string): IdentifiableBlacklist['id'] | null {
    return id;
  }

  protected async fetch(id: string): Promise<IdentifiableBlacklist | null> {
    const found = await this.repository.find(id);
    return found ? createIdentifiableBlacklist(found) : null;
  }
}
