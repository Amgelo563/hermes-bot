import { type NyxBot } from '@nyx-discord/core';
import type { ActionRowWrapper } from '@nyx-discord/framework';
import type {
  ButtonInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

import type { OptionalInlineField } from '../../../discord/embed/OptionalInlineField';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import { createIdentifiableRequest } from '../../../request/action/identity/IdentifiableRequest';
import { RequestAction } from '../../../request/action/RequestAction';
import type { RequestActionsManager } from '../../../request/action/RequestActionsManager';
import type { RequestPlaceholderContext } from '../../../request/message/placeholder/RequestPlaceholderContext';
import type { RequestMessagesParser } from '../../../request/message/RequestMessagesParser';
import type { RequestModalCodec } from '../../../request/modal/RequestModalCodec';
import type { RequestRequirementsChecker } from '../../../request/requirement/RequestRequirementsChecker';
import type { RequirementResultAggregate } from '../../../requirement/result/aggregate/RequirementResultAggregate';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { RequestData } from '../../../service/request/RequestData';
import { RequestCreateSession } from './RequestCreateSession';

export class RequestUpdateSession extends RequestCreateSession {
  protected readonly requirements: RequestRequirementsChecker;

  protected readonly cachedContext: RequestPlaceholderContext;

  protected readonly actions: RequestActionsManager;

  protected readonly requestMessages: RequestMessagesParser;

  protected override data: RequestData;

  protected readonly initialData: RequestData;

  protected readonly selectMenuRow: ActionRowWrapper<StringSelectMenuBuilder> | null;

  constructor(
    bot: NyxBot,
    startInteraction: ServiceActionInteraction,
    request: RequestData,
    messageService: HermesMessageService,
    modalCodec: RequestModalCodec,
    requirements: RequestRequirementsChecker,
    actions: RequestActionsManager,
  ) {
    super(
      bot,
      startInteraction,
      request,
      messageService,
      modalCodec,
      requirements,
      actions,
      [request.tag],
    );

    this.data = { ...request };
    this.initialData = { ...request };
    this.requestMessages = messageService.getRequestMessages();
    this.cachedContext = {
      user: startInteraction.user,
      services: {
        request,
      },
    };
    this.requirements = requirements;
    this.actions = actions;
    this.selectedTag = request.tag;
    this.selectMenuRow = null;
  }

  protected async handleConfirm(interaction: ButtonInteraction): Promise<void> {
    await this.actions.executeAction(
      RequestAction.enum.Update,
      interaction,
      createIdentifiableRequest(this.data),
    );
  }

  protected getDenyEmbed(
    context: RequestPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder {
    return this.requestMessages.getUpdateDenyEmbed(context, reasons);
  }

  protected getWarnEmbed(
    context: RequestPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder {
    return this.requestMessages.getUpdateWarnEmbed(context, reasons);
  }

  protected getPreviewingEmbed(
    context: RequestPlaceholderContext,
  ): EmbedBuilder {
    return this.requestMessages.getUpdatePreviewingEmbed(context);
  }

  protected override allowConfirm(): boolean {
    const hasChanged =
      this.data.title !== this.initialData.title
      || this.data.description !== this.initialData.description
      || this.data.budget !== this.initialData.budget;

    if (!hasChanged) {
      return false;
    }

    return super.allowConfirm();
  }

  protected onDataUpdate() {
    this.cachedContext.services = {
      request: this.data,
    };
  }

  protected override async checkRequirements(): Promise<RequirementResultAggregate> {
    return this.requirements.checkUpdate(this.cachedContext, {
      request: this.data,
      interaction: this.startInteraction,
      tag: this.selectedTag,
    });
  }
}
