import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import { ConfirmationSession } from '../../../bot/sessions/confirm/ConfirmationSession';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesErrorAgent } from '../../../error/HermesErrorAgent';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { RequestDataWithMember } from '../../data/RequestDataWithMember';
import type { RequestRepository } from '../../database/RequestRepository';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { RequestActionExecutor } from './RequestActionExecutor';

export class RequestDeleteExecutor implements RequestActionExecutor {
  protected readonly requestRepository: RequestRepository;

  protected readonly bot: NyxBot;

  protected readonly messages: HermesMessageService;

  protected readonly errorAgent: HermesErrorAgent;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    requestRepository: RequestRepository,
    errorAgent: HermesErrorAgent,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.requestRepository = requestRepository;
    this.errorAgent = errorAgent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordRequestAgent,
    request: RequestDataWithMember,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
      services: { request },
    };

    const requestMessages = this.messages.getRequestMessages();
    const deleteConfirm = requestMessages.getDeleteConfirmEmbed(context);
    const postEmbed = requestMessages.getPostEmbed(context);

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
      await this.requestRepository.delete(request.id);
      await agent.deleteRequest(request);
      await agent.postDeleteLog(member, request);
    } catch (e) {
      const errorId = nanoid(5);
      const errorEmbeds = requestMessages.getDeleteErrorEmbeds({
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

    const embed = requestMessages.getDeleteSuccessEmbed(context);
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
