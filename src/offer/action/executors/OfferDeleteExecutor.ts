import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import { ConfirmationSession } from '../../../bot/sessions/ConfirmationSession';
import type { OfferRepository } from '../../../hermes/database/OfferRepository';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { OfferData } from '../../../service/offer/OfferData';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferActionExecutor } from './OfferActionExecutor';

export class OfferDeleteExecutor implements OfferActionExecutor {
  protected readonly offerRepository: OfferRepository;

  protected readonly bot: NyxBot;

  protected readonly messages: HermesMessageService;

  protected readonly agent: DiscordOfferAgent;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    offerRepository: OfferRepository,
    agent: DiscordOfferAgent,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.offerRepository = offerRepository;
    this.agent = agent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    member: HermesMember,
    offer: OfferData,
  ): Promise<void> {
    if (!interaction.deferred && !interaction.replied) {
      if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: true });
      } else {
        await interaction.deferUpdate();
      }
    }

    const context = {
      member,
      services: { offer },
    };

    const offerMessages = this.messages.getOfferMessages();
    const deleteConfirm = offerMessages.getDeleteConfirmEmbed(context);
    const postEmbed = offerMessages.getPostEmbed(context);

    const confirm = new ConfirmationSession(
      this.bot,
      interaction as SessionStartInteraction,
      this.messages,
      [postEmbed, deleteConfirm],
      true,
      context,
    );

    await this.bot.sessions.start(confirm);

    const resultData = await confirm.getEndPromise();
    const confirmData = resultData.result;

    if (!confirmData || !confirmData.confirmed) return;

    const confirmInteraction = confirmData.button;

    await confirmInteraction.update({ components: [] });
    try {
      await this.offerRepository.delete(offer.id);
      await this.agent.deleteOffer(offer);
      await this.agent.postDeleteLog(member, offer);
    } catch (e) {
      const errorId = nanoid(5);

      const embeds = offerMessages.getDeleteErrorEmbeds({
        ...context,
        error: {
          instance: e as Error,
          id: errorId,
        },
      });

      await confirmInteraction.editReply({
        embeds: [embeds.user],
        components: [],
      });

      await this.agent.postError(embeds.log);

      return;
    }

    const embed = offerMessages.getDeleteSuccessEmbed(context);
    await confirmInteraction.editReply({
      embeds: [embed],
      components: [],
    });
  }
}
