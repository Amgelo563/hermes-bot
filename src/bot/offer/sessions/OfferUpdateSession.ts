import { type NyxBot } from '@nyx-discord/core';
import type { ActionRowWrapper } from '@nyx-discord/framework';
import type {
  ButtonInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

import type { OptionalInlineField } from '../../../discord/embed/OptionalInlineField';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import { createIdentifiableOffer } from '../../../offer/action/identity/IdentifiableOffer';
import { OfferAction } from '../../../offer/action/OfferAction';
import type { OfferActionsManager } from '../../../offer/action/OfferActionsManager';
import type { OfferMessagesParser } from '../../../offer/message/OfferMessagesParser';
import type { OfferPlaceholderContext } from '../../../offer/message/placeholder/OfferPlaceholderContext';
import type { OfferModalCodec } from '../../../offer/modal/OfferModalCodec';
import type { OfferRequirementsChecker } from '../../../offer/requirement/OfferRequirementsChecker';
import type { RequirementResultAggregate } from '../../../requirement/result/aggregate/RequirementResultAggregate';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { OfferData } from '../../../service/offer/OfferData';
import { OfferCreateSession } from './OfferCreateSession';

export class OfferUpdateSession extends OfferCreateSession {
  protected readonly requirements: OfferRequirementsChecker;

  protected readonly actions: OfferActionsManager;

  protected readonly offerMessages: OfferMessagesParser;

  protected override data: OfferData;

  protected readonly selectMenuRow: ActionRowWrapper<StringSelectMenuBuilder> | null;

  protected cachedContext: OfferPlaceholderContext;

  constructor(
    bot: NyxBot,
    startInteraction: ServiceActionInteraction,
    offer: OfferData,
    messageService: HermesMessageService,
    modalCodec: OfferModalCodec,
    requirements: OfferRequirementsChecker,
    actions: OfferActionsManager,
  ) {
    super(
      bot,
      startInteraction,
      offer,
      messageService,
      modalCodec,
      requirements,
      actions,
      offer.tags,
    );

    this.data = offer;
    this.offerMessages = messageService.getOfferMessages();
    this.cachedContext = {
      user: startInteraction.user,
      services: {
        offer,
      },
    };
    this.requirements = requirements;
    this.actions = actions;
    this.selectMenuRow = null;
  }

  protected async handleConfirm(interaction: ButtonInteraction): Promise<void> {
    await this.actions.executeAction(
      OfferAction.enum.Update,
      interaction,
      createIdentifiableOffer(this.data),
    );
  }

  protected getDenyEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder {
    return this.offerMessages.getUpdateDenyEmbed(context, reasons);
  }

  protected getWarnEmbed(
    context: OfferPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder {
    return this.offerMessages.getUpdateWarnEmbed(context, reasons);
  }

  protected getPreviewingEmbed(context: OfferPlaceholderContext): EmbedBuilder {
    return this.offerMessages.getUpdatePreviewingEmbed(context);
  }

  protected override checkRequirements(): Promise<RequirementResultAggregate> {
    return this.requirements.checkUpdate(this.cachedContext, {
      offer: this.data,
      interaction: this.startInteraction,
    });
  }

  protected override onDataUpdate() {
    this.cachedContext = {
      ...this.cachedContext,
      services: {
        ...this.cachedContext.services,
        offer: this.data,
      },
    };
  }
}
