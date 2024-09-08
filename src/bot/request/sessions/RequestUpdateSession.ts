import { type NyxBot } from '@nyx-discord/core';
import type { ActionRowWrapper } from '@nyx-discord/framework';
import type {
  ButtonInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

import type { OptionalInlineField } from '../../../discord/embed/OptionalInlineField';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import { RequestAction } from '../../../request/action/RequestAction';
import type { RequestActionsManager } from '../../../request/action/RequestActionsManager';
import type { RequestDataWithMember } from '../../../request/data/RequestDataWithMember';
import { createIdentifiableRequest } from '../../../request/identity/IdentifiableRequest';
import type { RequestPlaceholderContext } from '../../../request/message/placeholder/RequestPlaceholderContext';
import type { RequestMessagesParser } from '../../../request/message/read/RequestMessagesParser';
import type { RequestModalCodec } from '../../../request/modal/RequestModalCodec';
import type { RequestRequirementsChecker } from '../../../request/requirement/RequestRequirementsChecker';
import type { RequirementResultAggregate } from '../../../requirement/result/aggregate/RequirementResultAggregate';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagData } from '../../../tag/data/TagData';
import { RequestCreateSession } from './RequestCreateSession';

export class RequestUpdateSession extends RequestCreateSession {
  protected readonly requirements: RequestRequirementsChecker;

  protected readonly cachedContext: RequestPlaceholderContext;

  protected readonly actions: RequestActionsManager;

  protected readonly requestMessages: RequestMessagesParser;

  protected override data: RequestDataWithMember;

  protected readonly initialData: RequestDataWithMember;

  protected readonly selectMenuRow: ActionRowWrapper<StringSelectMenuBuilder> | null;

  constructor(
    bot: NyxBot,
    startInteraction: ServiceActionInteraction,
    request: RequestDataWithMember,
    messageService: HermesMessageService,
    modalCodec: RequestModalCodec,
    requirements: RequestRequirementsChecker,
    actions: RequestActionsManager,
    startMember: HermesMember,
    tags: TagData[],
  ) {
    super(
      bot,
      startInteraction,
      request,
      messageService,
      modalCodec,
      requirements,
      actions,
      startMember,
      tags,
    );

    this.data = { ...request };
    this.initialData = { ...request };
    this.requestMessages = messageService.getRequestMessages();
    this.cachedContext = {
      member: startMember,
      services: {
        request,
      },
    };
    this.requirements = requirements;
    this.actions = actions;
    this.selectedTag = request.tag;

    // If request has no tag, allow user to select one, otherwise do not
    this.selectMenuRow =
      this.data.tag === null
        ? this.createSelectRow(this.requestMessages)
        : null;
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
      member: this.startMember,
    });
  }
}
