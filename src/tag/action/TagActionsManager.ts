import type { NyxBot } from '@nyx-discord/core';

import type { HermesConfigWrapper } from '../../config/file/HermesConfigWrapper';
import type { HermesErrorAgent } from '../../error/HermesErrorAgent';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { AbstractActionsManager } from '../../service/action/AbstractActionsManager';
import { ServiceActionsCustomIdCodec } from '../../service/action/codec/ServiceActionsCustomIdCodec';
import { ServiceActionCustomIdBuilder } from '../../service/action/customId/ServiceActionCustomIdBuilder';
import type { ServiceActionExecutor } from '../../service/action/executor/ServiceActionExecutor';
import { ServiceObject } from '../../service/ServiceObject';
import type { TagCreateData } from '../data/TagCreateData';
import type { TagRepository } from '../database/TagRepository';
import type { DiscordTagAgent } from '../discord/DiscordTagAgent';
import type { IdentifiableTag } from '../identity/IdentifiableTag';
import { createIdentifiableTag } from '../identity/IdentifiableTag';
import type { TagModalCodec } from '../modal/TagModalCodec';
import type { TagActionsCustomIdCodec } from './codec/TagActionsCustomIdCodec';
import type { TagActionExecutor } from './executors/TagActionExecutor';
import { TagCreateExecutor } from './executors/TagCreateExecutor';
import { TagDeleteExecutor } from './executors/TagDeleteExecutor';
import { TagInfoExecutor } from './executors/TagInfoExecutor';
import { TagNotFoundExecutor } from './executors/TagNotFoundExecutor';
import { TagRequestUpdateExecutor } from './executors/TagRequestUpdateExecutor';
import { TagUpdateExecutor } from './executors/TagUpdateExecutor';
import type { TagActionOptions, TagActionType } from './TagAction';
import { TagAction } from './TagAction';

export class TagActionsManager extends AbstractActionsManager<
  IdentifiableTag,
  TagActionOptions,
  DiscordTagAgent,
  TagCreateData
> {
  protected readonly repository: TagRepository;

  constructor(
    repository: TagRepository,
    codec: TagActionsCustomIdCodec,
    executors: Map<TagActionType, TagActionExecutor>,
    createExecutor: ServiceActionExecutor<DiscordTagAgent, TagCreateData>,
    missingExecutor: ServiceActionExecutor<DiscordTagAgent, string>,
    agent: DiscordTagAgent,
  ) {
    super(codec, executors, createExecutor, missingExecutor, agent);
    this.repository = repository;
  }

  public static create(
    bot: NyxBot,
    configWrapper: HermesConfigWrapper,
    messageService: HermesMessageService,
    repository: TagRepository,
    modalCodec: TagModalCodec,
    tagAgent: DiscordTagAgent,
    errorAgent: HermesErrorAgent,
  ): TagActionsManager {
    const actionsCodec = ServiceActionsCustomIdCodec.createActions<
      IdentifiableTag,
      TagActionOptions
    >(ServiceObject.enum.Tag);

    const executors = new Map<TagActionType, TagActionExecutor>([
      [
        TagAction.enum.Delete,
        new TagDeleteExecutor(
          bot,
          messageService,
          repository,
          configWrapper,
          errorAgent,
        ),
      ],
      [
        TagAction.enum.ReqUpd,
        new TagRequestUpdateExecutor(actionsCodec, modalCodec, configWrapper),
      ],
      [
        TagAction.enum.Info,
        new TagInfoExecutor(messageService, actionsCodec, configWrapper),
      ],
      [
        TagAction.enum.Update,
        new TagUpdateExecutor(
          messageService.getTagsMessages(),
          modalCodec,
          repository,
          configWrapper,
          errorAgent,
        ),
      ],
    ]);
    const notFoundExecutor = new TagNotFoundExecutor(
      messageService.getTagsMessages(),
    );
    const createExecutor = new TagCreateExecutor(
      messageService.getTagsMessages(),
      repository,
      configWrapper,
      errorAgent,
    );

    return new TagActionsManager(
      repository,
      actionsCodec,
      executors,
      createExecutor,
      notFoundExecutor,
      tagAgent,
    );
  }

  protected createBuilderFromCustomId(
    customId: string,
  ): ServiceActionCustomIdBuilder<TagActionOptions> | null {
    return ServiceActionCustomIdBuilder.fromServiceCustomId<TagActionOptions>(
      customId,
      this.codec.getSeparator(),
      this.codec.getMetadataSeparator(),
      TagAction,
      ServiceObject.enum.Tag,
    );
  }

  protected async fetch(id: number): Promise<IdentifiableTag | null> {
    const data = await this.repository.find(id);
    if (!data) return null;

    return createIdentifiableTag(data);
  }
}
