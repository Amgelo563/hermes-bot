import type { NyxBot } from '@nyx-discord/core';
import { IllegalStateError } from '@nyx-discord/core';
import { ActionRowWrapper } from '@nyx-discord/framework';
import type {
  ButtonInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';

import type { OptionalInlineField } from '../../../discord/embed/OptionalInlineField';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { RequestActionsManager } from '../../../request/action/RequestActionsManager';
import type { RequestPlaceholderContext } from '../../../request/message/placeholder/RequestPlaceholderContext';
import type { RequestMessagesParser } from '../../../request/message/RequestMessagesParser';
import type { RequestModalCodec } from '../../../request/modal/RequestModalCodec';
import type { RequestRequirementsChecker } from '../../../request/requirement/RequestRequirementsChecker';
import type { RequirementResultAggregate } from '../../../requirement/result/aggregate/RequirementResultAggregate';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { RequestData } from '../../../service/request/RequestData';
import type { RequestModalInputData } from '../../../service/request/RequestModalInputData';
import type { TagData } from '../../../service/tag/TagData';
import { AbstractServiceSession } from '../../sessions/AbstractServiceSession';

export class RequestCreateSession extends AbstractServiceSession<RequestModalInputData> {
  protected readonly requirements: RequestRequirementsChecker;

  protected readonly requestMessages: RequestMessagesParser;

  protected readonly cachedContext: RequestPlaceholderContext;

  protected readonly selectMenuRow: ActionRowWrapper<StringSelectMenuBuilder> | null;

  protected readonly actions: RequestActionsManager;

  protected readonly tags: TagData[];

  protected selectedTag: TagData | null = null;

  constructor(
    bot: NyxBot,
    startInteraction: ServiceActionInteraction,
    data: RequestModalInputData,
    messageService: HermesMessageService,
    modalCodec: RequestModalCodec,
    requirements: RequestRequirementsChecker,
    actions: RequestActionsManager,
    tags: TagData[],
  ) {
    super(bot, startInteraction, data, messageService, modalCodec);

    this.requestMessages = messageService.getRequestMessages();
    this.tags = tags;
    this.cachedContext = {
      user: startInteraction.user,
      services: {
        request: this.mockFullData(data),
      },
    };
    this.requirements = requirements;
    this.actions = actions;
    this.selectMenuRow = this.createSelectRow(this.requestMessages);
  }

  protected createSelectRow(
    messages: RequestMessagesParser,
  ): ActionRowWrapper<StringSelectMenuBuilder> {
    const row = new ActionRowWrapper<StringSelectMenuBuilder>();

    const select = messages
      .getCreateTagSelect(this.cachedContext)
      .setMaxValues(1)
      .setCustomId(this.customId.build());

    const options = this.tags.map((tag) => ({
      label: tag.name,
      description: tag.description,
      value: tag.id.toString(),
      default: this.selectedTag?.id === tag.id,
    }));

    select.addOptions(options);

    row.add(select);

    return row;
  }

  protected handleConfirm(interaction: ButtonInteraction): Promise<void> {
    const tag = this.selectedTag;
    if (tag === null) {
      throw new IllegalStateError();
    }

    const data = {
      ...this.data,
      tagId: tag.id,
    };

    return this.actions.create(interaction, data);
  }

  protected mockFullData(create: RequestModalInputData): RequestData {
    return {
      ...create,
      id: 0,
      guildId: this.startInteraction.guildId ?? '',
      createdAt: new Date(),
      lastPostedAt: new Date(),
      channelId: this.startInteraction.channelId ?? '',
      messageId: this.startInteraction.id,
      tagId: 0,
      tag: this.selectedTag ?? this.messages.getTagsMessages().getNoTagsTag(),
    };
  }

  protected async handleSelectMenu(
    interaction: StringSelectMenuInteraction,
  ): Promise<boolean> {
    await interaction.deferUpdate();

    const value = Number.parseInt(interaction.values[0]);
    this.selectedTag = this.tags.find((tag) => tag.id === value) as TagData;
    this.onDataUpdate();

    const options = this.tags.map((tag) => ({
      label: tag.name,
      description: tag.description,
      value: tag.id.toString(),
      default: this.selectedTag?.id === tag.id,
    }));

    if (this.selectMenuRow !== null) {
      this.selectMenuRow.editAll((select) => {
        return select.setOptions(options);
      });
    }

    await this.buildAndReply(interaction);
    return true;
  }

  protected override allowConfirm(): boolean {
    return this.selectedTag !== null;
  }

  protected getDenyEmbed(
    context: RequestPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder {
    return this.requestMessages.getCreateDenyEmbed(context, reasons);
  }

  protected getPostEmbed(context: RequestPlaceholderContext): EmbedBuilder {
    return this.requestMessages.getPostEmbed(context);
  }

  protected getWarnEmbed(
    context: RequestPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder {
    return this.requestMessages.getCreateWarnEmbed(context, reasons);
  }

  protected getPreviewingEmbed(
    context: RequestPlaceholderContext,
  ): EmbedBuilder {
    return this.requestMessages.getCreatePreviewingEmbed(context);
  }

  protected onDataUpdate() {
    this.cachedContext.services = {
      request: this.mockFullData(this.data),
    };
  }

  protected async checkRequirements(): Promise<RequirementResultAggregate> {
    return this.requirements.checkPublish(this.cachedContext, {
      request: this.mockFullData(this.data),
      tag: this.selectedTag,
      interaction: this.startInteraction,
    });
  }
}
