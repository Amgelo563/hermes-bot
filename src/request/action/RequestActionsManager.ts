import type { NyxBot } from '@nyx-discord/core';
import type { HermesConfigWrapper } from '../../config/file/HermesConfigWrapper';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { AbstractActionsManager } from '../../service/action/AbstractActionsManager';
import { ServiceActionsCustomIdCodec } from '../../service/action/codec/ServiceActionsCustomIdCodec';
import { ServiceActionCustomIdBuilder } from '../../service/action/customId/ServiceActionCustomIdBuilder';
import type { ServiceActionExecutor } from '../../service/action/executor/ServiceActionExecutor';
import { ServiceObject } from '../../service/ServiceObject';
import type { TagRepository } from '../../tag/database/TagRepository';
import type { RequestCreateData } from '../data/RequestCreateData';

import type { RequestRepository } from '../database/RequestRepository';
import type { DiscordRequestAgent } from '../discord/DiscordRequestAgent';
import type { IdentifiableRequest } from '../identity/IdentifiableRequest';
import { createIdentifiableRequest } from '../identity/IdentifiableRequest';
import type { RequestModalCodec } from '../modal/RequestModalCodec';
import type { RequestRequirementsChecker } from '../requirement/RequestRequirementsChecker';
import type { RequestActionsCustomIdCodec } from './codec/RequestActionsCustomIdCodec';
import type { RequestActionExecutor } from './executors/RequestActionExecutor';
import { RequestCreateExecutor } from './executors/RequestCreateExecutor';
import { RequestDeleteExecutor } from './executors/RequestDeleteExecutor';
import { RequestInfoExecutor } from './executors/RequestInfoExecutor';
import { RequestNotFoundExecutor } from './executors/RequestNotFoundExecutor';
import { RequestRepostExecutor } from './executors/RequestRepostExecutor';
import { RequestRequestUpdateExecutor } from './executors/RequestRequestUpdateExecutor';
import { RequestUpdateExecutor } from './executors/RequestUpdateExecutor';
import type { RequestActionOptions, RequestActionType } from './RequestAction';
import { RequestAction } from './RequestAction';

export class RequestActionsManager extends AbstractActionsManager<
  IdentifiableRequest,
  RequestActionOptions,
  DiscordRequestAgent,
  RequestCreateData
> {
  protected readonly repository: RequestRepository;

  constructor(
    repository: RequestRepository,
    codec: RequestActionsCustomIdCodec,
    executors: Map<RequestActionType, RequestActionExecutor>,
    createExecutor: ServiceActionExecutor<
      DiscordRequestAgent,
      RequestCreateData
    >,
    missingExecutor: ServiceActionExecutor<DiscordRequestAgent, string>,
    agent: DiscordRequestAgent,
  ) {
    super(codec, executors, createExecutor, missingExecutor, agent);
    this.repository = repository;
  }

  public static create(
    bot: NyxBot,
    messageService: HermesMessageService,
    configWrapper: HermesConfigWrapper,
    repository: RequestRepository,
    agent: DiscordRequestAgent,
    modalCodec: RequestModalCodec,
    requirements: RequestRequirementsChecker,
    tagRepository: TagRepository,
  ): RequestActionsManager {
    const requestMessages = messageService.getRequestMessages();

    const customIdCodec = ServiceActionsCustomIdCodec.createActions<
      IdentifiableRequest,
      RequestActionOptions
    >(ServiceObject.enum.Request);

    const executors = new Map<RequestActionType, RequestActionExecutor>([
      [
        RequestAction.enum.Update,
        new RequestUpdateExecutor(repository, requestMessages),
      ],
      [
        RequestAction.enum.Info,
        new RequestInfoExecutor(messageService, customIdCodec, configWrapper),
      ],
      [
        RequestAction.enum.Repost,
        new RequestRepostExecutor(
          bot,
          requestMessages,
          requirements,
          agent,
          repository,
        ),
      ],
      [
        RequestAction.enum.Delete,
        new RequestDeleteExecutor(bot, messageService, repository),
      ],
    ]);
    const createExecutor = new RequestCreateExecutor(
      requestMessages,
      repository,
    );
    const notFoundExecutor = new RequestNotFoundExecutor(requestMessages);

    const manager = new RequestActionsManager(
      repository,
      customIdCodec,
      executors,
      createExecutor,
      notFoundExecutor,
      agent,
    );

    manager.setExecutor(
      RequestAction.enum.ReqUpd,
      new RequestRequestUpdateExecutor(
        bot,
        repository,
        modalCodec,
        messageService,
        requirements,
        manager,
        configWrapper,
        tagRepository,
      ),
    );

    return manager;
  }

  protected createBuilderFromCustomId(
    customId: string,
  ): ServiceActionCustomIdBuilder<RequestActionOptions> | null {
    return ServiceActionCustomIdBuilder.fromServiceCustomId<RequestActionOptions>(
      customId,
      this.codec.getSeparator(),
      this.codec.getMetadataSeparator(),
      RequestAction,
      ServiceObject.enum.Request,
    );
  }

  protected async fetch(id: number): Promise<IdentifiableRequest | null> {
    const data = await this.repository.find(id);
    if (!data) return null;

    return createIdentifiableRequest(data);
  }
}
