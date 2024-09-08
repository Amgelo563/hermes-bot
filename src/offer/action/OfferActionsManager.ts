import type { NyxBot } from '@nyx-discord/core';

import type { HermesConfigWrapper } from '../../config/file/HermesConfigWrapper';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { AbstractActionsManager } from '../../service/action/AbstractActionsManager';
import { ServiceActionsCustomIdCodec } from '../../service/action/codec/ServiceActionsCustomIdCodec';
import { ServiceActionCustomIdBuilder } from '../../service/action/customId/ServiceActionCustomIdBuilder';
import type { ServiceActionExecutor } from '../../service/action/executor/ServiceActionExecutor';
import { ServiceObject } from '../../service/ServiceObject';
import type { OfferCreateData } from '../data/OfferCreateData';
import type { OfferRepository } from '../database/OfferRepository';
import type { DiscordOfferAgent } from '../discord/DiscordOfferAgent';
import type { IdentifiableOffer } from '../identity/IdentifiableOffer';
import { createIdentifiableOffer } from '../identity/IdentifiableOffer';
import type { OfferModalCodec } from '../modal/OfferModalCodec';
import type { OfferRequirementsChecker } from '../requirement/OfferRequirementsChecker';
import type { OfferActionsCustomIdCodec } from './codec/OfferActionsCustomIdCodec';
import type { OfferActionExecutor } from './executors/OfferActionExecutor';
import { OfferCreateExecutor } from './executors/OfferCreateExecutor';
import { OfferDeleteExecutor } from './executors/OfferDeleteExecutor';
import { OfferInfoExecutor } from './executors/OfferInfoExecutor';
import { OfferNotFoundExecutor } from './executors/OfferNotFoundExecutor';
import { OfferRepostExecutor } from './executors/OfferRepostExecutor';
import { OfferRequestUpdateExecutor } from './executors/OfferRequestUpdateExecutor';
import { OfferUpdateExecutor } from './executors/OfferUpdateExecutor';
import type { OfferActionOptions, OfferActionType } from './OfferAction';
import { OfferAction } from './OfferAction';

export class OfferActionsManager extends AbstractActionsManager<
  IdentifiableOffer,
  OfferActionOptions,
  DiscordOfferAgent,
  OfferCreateData
> {
  protected readonly repository: OfferRepository;

  constructor(
    repository: OfferRepository,
    codec: OfferActionsCustomIdCodec,
    executors: Map<OfferActionType, OfferActionExecutor>,
    createExecutor: ServiceActionExecutor<DiscordOfferAgent, OfferCreateData>,
    missingExecutor: ServiceActionExecutor<DiscordOfferAgent, string>,
    agent: DiscordOfferAgent,
  ) {
    super(codec, executors, createExecutor, missingExecutor, agent);
    this.repository = repository;
  }

  public static create(
    bot: NyxBot,
    configWrapper: HermesConfigWrapper,
    repository: OfferRepository,
    modalCodec: OfferModalCodec,
    messages: HermesMessageService,
    requirements: OfferRequirementsChecker,
    agent: DiscordOfferAgent,
  ): OfferActionsManager {
    const customIdCodec = ServiceActionsCustomIdCodec.createActions<
      IdentifiableOffer,
      OfferActionOptions
    >(ServiceObject.enum.Offer);

    const offerMessages = messages.getOfferMessages();

    const executors = new Map<OfferActionType, OfferActionExecutor>([
      [
        OfferAction.enum.Info,
        new OfferInfoExecutor(messages, customIdCodec, configWrapper),
      ],
      [
        OfferAction.enum.Delete,
        new OfferDeleteExecutor(bot, messages, repository),
      ],
      [
        OfferAction.enum.Update,
        new OfferUpdateExecutor(repository, offerMessages),
      ],
      [
        OfferAction.enum.Repost,
        new OfferRepostExecutor(bot, offerMessages, requirements, repository),
      ],
    ]);
    const createExecutor = new OfferCreateExecutor(offerMessages, repository);
    const notFoundExecutor = new OfferNotFoundExecutor(offerMessages);

    const manager = new OfferActionsManager(
      repository,
      customIdCodec,
      executors,
      createExecutor,
      notFoundExecutor,
      agent,
    );

    manager.setExecutor(
      OfferAction.enum.ReqUpd,
      new OfferRequestUpdateExecutor(
        repository,
        modalCodec,
        messages,
        requirements,
        manager,
        bot,
        configWrapper,
      ),
    );

    return manager;
  }

  protected createBuilderFromCustomId(
    customId: string,
  ): ServiceActionCustomIdBuilder<OfferActionOptions> | null {
    return ServiceActionCustomIdBuilder.fromServiceCustomId<OfferActionOptions>(
      customId,
      this.codec.getSeparator(),
      this.codec.getMetadataSeparator(),
      OfferAction,
      ServiceObject.enum.Offer,
    );
  }

  protected async fetch(id: number): Promise<IdentifiableOffer | null> {
    const data = await this.repository.find(id);
    if (!data) return null;
    const member = await this.agent.fetchMemberOrUnknown(data.memberId);

    return createIdentifiableOffer({ ...data, member });
  }
}
