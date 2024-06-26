import type { NyxBot } from '@nyx-discord/core';

import { OfferUpdateSession } from '../../../bot/offer/sessions/OfferUpdateSession';
import type { HermesConfigWrapper } from '../../../config/HermesConfigWrapper';
import type { OfferRepository } from '../../../hermes/database/OfferRepository';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { OfferData } from '../../../service/offer/OfferData';
import type { OfferModalCodec } from '../../modal/OfferModalCodec';
import type { OfferRequirementsChecker } from '../../requirement/OfferRequirementsChecker';
import type { OfferActionsManager } from '../OfferActionsManager';
import type { OfferActionExecutor } from './OfferActionExecutor';

export class OfferRequestUpdateExecutor implements OfferActionExecutor {
  protected readonly modalCodec: OfferModalCodec;

  protected readonly repository: OfferRepository;

  protected readonly messages: HermesMessageService;

  protected readonly actions: OfferActionsManager;

  protected readonly requirements: OfferRequirementsChecker;

  protected readonly bot: NyxBot;

  protected readonly config: HermesConfigWrapper;

  constructor(
    repository: OfferRepository,
    modalCodec: OfferModalCodec,
    messages: HermesMessageService,
    requirements: OfferRequirementsChecker,
    actions: OfferActionsManager,
    bot: NyxBot,
    config: HermesConfigWrapper,
  ) {
    this.repository = repository;
    this.modalCodec = modalCodec;
    this.messages = messages;
    this.requirements = requirements;
    this.actions = actions;
    this.bot = bot;
    this.config = config;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    member: HermesMember,
    offer: OfferData,
  ): Promise<void> {
    const context = {
      member,
      services: { offer },
    };

    if (!this.config.canEditOffer(member, offer)) {
      const notFound = this.messages
        .getOfferMessages()
        .getNotFoundErrorEmbed(context, offer.id.toString());

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [notFound] });
        return;
      }

      await interaction.reply({ embeds: [notFound], ephemeral: true });
    }

    const session = new OfferUpdateSession(
      this.bot,
      interaction,
      offer,
      this.messages,
      this.modalCodec,
      this.requirements,
      this.actions,
      member,
    );

    await this.bot.sessions.start(session);
  }
}
