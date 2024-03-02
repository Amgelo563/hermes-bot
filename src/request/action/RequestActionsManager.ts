import type { NyxBot } from '@nyx-discord/core';
import type { HermesConfigWrapper } from '../../config/HermesConfigWrapper';

import type { RequestRepository } from '../../hermes/database/RequestRepository';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { AbstractActionsManager } from '../../service/action/AbstractActionsManager';
import { ServiceActionsCustomIdCodec } from '../../service/action/codec/ServiceActionsCustomIdCodec';
import { ServiceActionCustomIdBuilder } from '../../service/action/customId/ServiceActionCustomIdBuilder';
import type { ServiceActionExecutor } from '../../service/action/executor/ServiceActionExecutor';
import type { RequestCreateData } from '../../service/request/RequestCreateData';
import { ServiceObject } from '../../service/ServiceObject';
import type { DiscordRequestAgent } from '../discord/DiscordRequestAgent';
import type { RequestModalCodec } from '../modal/RequestModalCodec';
import type { RequestRequirementsChecker } from '../requirement/RequestRequirementsChecker';
import type { RequestActionsCustomIdCodec } from './codec/RequestActionsCustomIdCodec';
import { RequestCreateExecutor } from './executors/RequestCreateExecutor';
import { RequestDeleteExecutor } from './executors/RequestDeleteExecutor';
import { RequestInfoExecutor } from './executors/RequestInfoExecutor';
import { RequestNotFoundExecutor } from './executors/RequestNotFoundExecutor';
import { RequestRepostExecutor } from './executors/RequestRepostExecutor';
import { RequestRequestUpdateExecutor } from './executors/RequestRequestUpdateExecutor';
import { RequestUpdateExecutor } from './executors/RequestUpdateExecutor';
import type { IdentifiableRequest } from './identity/IdentifiableRequest';
import { createIdentifiableRequest } from './identity/IdentifiableRequest';
import type { RequestActionOptions, RequestActionType } from './RequestAction';
import { RequestAction } from './RequestAction';

export class RequestActionsManager extends AbstractActionsManager<
  IdentifiableRequest,
  RequestActionOptions,
  RequestCreateData
> {
  protected readonly repository: RequestRepository;

  constructor(
    repository: RequestRepository,
    codec: RequestActionsCustomIdCodec,
    executors: Map<
      RequestActionType,
      ServiceActionExecutor<IdentifiableRequest>
    >,
    createExecutor: ServiceActionExecutor<RequestCreateData>,
    missingExecutor: ServiceActionExecutor<string>,
  ) {
    super(codec, executors, createExecutor, missingExecutor);
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
  ): RequestActionsManager {
    const requestMessages = messageService.getRequestMessages();

    const customIdCodec = ServiceActionsCustomIdCodec.createActions<
      IdentifiableRequest,
      RequestActionOptions
    >(ServiceObject.enum.Request);

    const executors = new Map<
      RequestActionType,
      ServiceActionExecutor<IdentifiableRequest>
    >([
      [
        RequestAction.enum.Update,
        new RequestUpdateExecutor(repository, requestMessages, agent),
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
        new RequestDeleteExecutor(bot, messageService, repository, agent),
      ],
    ]);
    const createExecutor = new RequestCreateExecutor(
      requestMessages,
      repository,
      agent,
    );
    const notFoundExecutor = new RequestNotFoundExecutor(requestMessages);

    const manager = new RequestActionsManager(
      repository,
      customIdCodec,
      executors,
      createExecutor,
      notFoundExecutor,
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
      this.codec.getDataSeparator(),
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
