import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import { nanoid } from 'nanoid';

import { ConfirmationSession } from '../../../bot/sessions/ConfirmationSession';
import type { RequestRepository } from '../../../hermes/database/RequestRepository';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { RequestData } from '../../../service/request/RequestData';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { RequestActionExecutor } from './RequestActionExecutor';

export class RequestDeleteExecutor implements RequestActionExecutor {
  protected readonly requestRepository: RequestRepository;

  protected readonly bot: NyxBot;

  protected readonly messages: HermesMessageService;

  protected readonly agent: DiscordRequestAgent;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    requestRepository: RequestRepository,
    requestAgent: DiscordRequestAgent,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.requestRepository = requestRepository;
    this.agent = requestAgent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    request: RequestData,
  ): Promise<void> {
    const context = {
      user: interaction.user,
      services: { request },
    };

    if (!interaction.deferred && !interaction.replied) {
      if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: true });
      } else {
        await interaction.deferUpdate();
      }
    }

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

    await this.bot.sessions.start(confirm);

    const resultData = await confirm.getEndPromise();
    const confirmData = resultData.result;

    if (!confirmData || !confirmData.confirmed) return;

    const confirmInteraction = confirmData.button;

    await confirmInteraction.update({ components: [] });
    try {
      await this.requestRepository.delete(request.id);
      await this.agent.deleteRequest(request);
      await this.agent.postDeleteLog(context.user, request);
    } catch (e) {
      const errorId = nanoid(5);

      const embeds = requestMessages.getDeleteErrorEmbeds({
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

    const embed = requestMessages.getDeleteSuccessEmbed(context);
    await confirmInteraction.editReply({
      embeds: [embed],
      components: [],
    });
  }
}
