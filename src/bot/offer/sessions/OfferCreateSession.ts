import { type NyxBot } from '@nyx-discord/core';
import { ActionRowWrapper } from '@nyx-discord/framework';
import type {
  ButtonInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';

import type { OptionalInlineField } from '../../../discord/embed/OptionalInlineField';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { OfferActionsManager } from '../../../offer/action/OfferActionsManager';
import type { OfferCreateData } from '../../../offer/data/OfferCreateData';
import type { OfferDataWithMember } from '../../../offer/data/OfferDataWithMember';
import type { OfferPlaceholderContext } from '../../../offer/message/placeholder/OfferPlaceholderContext';
import type { OfferMessagesParser } from '../../../offer/message/read/OfferMessagesParser';
import type { OfferModalCodec } from '../../../offer/modal/OfferModalCodec';
import type { OfferRequirementsChecker } from '../../../offer/requirement/OfferRequirementsChecker';
import type { RequirementResultAggregate } from '../../../requirement/result/aggregate/RequirementResultAggregate';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagData } from '../../../tag/data/TagData';
import { AbstractServiceSession } from '../../sessions/service/AbstractServiceSession';

export class OfferCreateSession extends AbstractServiceSession<OfferCreateData> {
  protected readonly requirements: OfferRequirementsChecker;

  protected readonly tags: TagData[];

  protected readonly selectMenuRow: ActionRowWrapper<StringSelectMenuBuilder> | null;

  protected readonly actions: OfferActionsManager;

  protected readonly offerMessages: OfferMessagesParser;

  protected cachedContext: OfferPlaceholderContext;

  constructor(
    bot: NyxBot,
    startInteraction: ServiceActionInteraction,
    data: OfferCreateData,
    messageService: HermesMessageService,
    modalCodec: OfferModalCodec,
    requirements: OfferRequirementsChecker,
    actions: OfferActionsManager,
    startMember: HermesMember,
    tags: TagData[],
  ) {
    super(bot, startInteraction, data, messageService, modalCodec, startMember);

    this.offerMessages = messageService.getOfferMessages();
    this.tags = tags;
    this.cachedContext = {
      member: startMember,
      services: {
        offer: this.mockFullData(data),
      },
    };
    this.requirements = requirements;
    this.actions = actions;
    this.selectMenuRow = this.createSelectRow(this.offerMessages);
  }

  protected mockFullData(create: OfferCreateData): OfferDataWithMember {
    return {
      ...create,
      id: 0,
      guildId: this.startInteraction.guildId ?? '',
      createdAt: new Date(),
      lastPostedAt: new Date(),
      channelId: this.startInteraction.channelId ?? '',
      messageId: this.startInteraction.id,
    };
  }

  protected override async handleSelectMenu(
    interaction: StringSelectMenuInteraction,
  ): Promise<boolean> {
    await interaction.deferUpdate();

    this.data.tags = this.tags.filter((tag) =>
      interaction.values.includes(tag.id.toString()),
    );
    this.onDataUpdate();

    if (this.selectMenuRow) {
      this.selectMenuRow.editAll((select) => {
        const newOptions = select.options.map((option) => {
          return option.setDefault(
            this.data.tags
              .map((tag) => String(tag.id))
              .includes(option.data.value ?? ''),
          );
        });

        return select.setOptions(newOptions);
      });
    }

    await this.buildAndReply(interaction);
    return true;
  }

  protected createSelectRow(
    messages: OfferMessagesParser,
  ): ActionRowWrapper<StringSelectMenuBuilder> {
    const select = messages
      .getCreateTagSelect(this.cachedContext)
      .setMaxValues(this.tags.length)
      .setCustomId(this.customId.build());

    const options = this.tags.map((tag) => ({
      label: tag.name,
      description: tag.description,
      value: tag.id.toString(),
      default: this.data.tags.includes(tag),
    }));

    select.setOptions(options);

    return new ActionRowWrapper<StringSelectMenuBuilder>(select);
  }

  protected async handleConfirm(interaction: ButtonInteraction): Promise<void> {
    await this.actions.create(interaction, this.data);
  }

  protected override allowConfirm(): boolean {
    return this.data.tags.length > 0;
  }

  protected onDataUpdate(): void {
    this.cachedContext = {
      ...this.cachedContext,
      services: {
        ...this.cachedContext.services,
        offer: this.mockFullData(this.data),
      },
    };
  }

  protected getDenyEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder {
    return this.offerMessages.getCreateDenyEmbed(context, reasons);
  }

  protected getPostEmbed(context: OfferPlaceholderContext): EmbedBuilder {
    return this.offerMessages.getPostEmbed(context);
  }

  protected getWarnEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder {
    return this.offerMessages.getCreateWarnEmbed(context, reasons);
  }

  protected getPreviewingEmbed(context: OfferPlaceholderContext): EmbedBuilder {
    return this.offerMessages.getCreatePreviewingEmbed(context);
  }

  protected checkRequirements(): Promise<RequirementResultAggregate> {
    return this.requirements.checkPublish(this.cachedContext, {
      offer: this.data,
      interaction: this.startInteraction,
      member: this.startMember,
    });
  }
}
