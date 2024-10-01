import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import { ConfirmationSession } from '../../../bot/sessions/confirm/ConfirmationSession';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesErrorAgent } from '../../../error/HermesErrorAgent';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { OfferDataWithMember } from '../../data/OfferDataWithMember';
import type { OfferRepository } from '../../database/OfferRepository';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferActionExecutor } from './OfferActionExecutor';

export class OfferDeleteExecutor implements OfferActionExecutor {
  protected readonly offerRepository: OfferRepository;

  protected readonly bot: NyxBot;

  protected readonly messages: HermesMessageService;

  protected readonly errorAgent: HermesErrorAgent;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    offerRepository: OfferRepository,
    errorAgent: HermesErrorAgent,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.offerRepository = offerRepository;
    this.errorAgent = errorAgent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordOfferAgent,
    offer: OfferDataWithMember,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const member = await agent.fetchMemberFromInteraction(interaction);
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

    await this.bot.getSessionManager().start(confirm);

    const resultData = await confirm.getEndPromise();
    const confirmData = resultData.result;

    if (!confirmData || !confirmData.confirmed) return;

    const confirmInteraction = confirmData.button;

    await confirmInteraction.update({ components: [] });
    try {
      await this.offerRepository.delete(offer.id);
      await agent.deleteOffer(offer);
      await agent.postDeleteLog(member, offer);
    } catch (e) {
      const errorId = nanoid(5);
      const errorEmbeds = offerMessages.getDeleteErrorEmbeds({
        ...context,
        error: {
          instance: e as Error,
          id: errorId,
        },
      });

      await this.errorAgent.consumeWithErrorEmbeds(
        e as object,
        errorEmbeds,
        confirmInteraction,
      );

      return;
    }

    const embed = offerMessages.getDeleteSuccessEmbed(context);
    await confirmInteraction.editReply({
      embeds: [embed],
      components: [],
    });
  }

  public async defer(interaction: ServiceActionInteraction): Promise<void> {
    if (!interaction.deferred && !interaction.replied) {
      if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: true });
      } else {
        await interaction.deferUpdate();
      }
    }
  }
}
