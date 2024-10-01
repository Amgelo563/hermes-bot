import type { Identifiable, NyxBot } from '@nyx-discord/core';
import type {
  EmbedBuilder,
  Interaction,
  RepliableInteraction,
} from 'discord.js';

import type { ErrorEmbedsData } from '../hermes/message/error/ErrorEmbedsData';
import type { DiscordServiceAgent } from '../service/discord/DiscordServiceAgent';

export class HermesErrorAgent {
  protected readonly agent: DiscordServiceAgent;

  protected readonly bot: NyxBot;

  constructor(bot: NyxBot, agent: DiscordServiceAgent) {
    this.bot = bot;
    this.agent = agent;
  }

  public static create(bot: NyxBot, agent: DiscordServiceAgent) {
    return new HermesErrorAgent(bot, agent);
  }

  public start() {
    const bot = this.bot;

    const commandErrorHandler = bot
      .getCommandManager()
      .getExecutor()
      .getErrorHandler();

    const clientEventErrorHandler = bot
      .getEventManager()
      .getClientBus()
      .getDispatcher()
      .getErrorHandler();

    const scheduleErrorHandler = bot
      .getScheduleManager()
      .getExecutor()
      .getErrorHandler();

    const sessionExecutor = bot.getSessionManager().getExecutor();
    const sessionStartErrorHandler = sessionExecutor.getStartErrorHandler();
    const sessionUpdateErrorHandler = sessionExecutor.getUpdateErrorHandler();
    const sessionEndErrorHandler = sessionExecutor.getEndErrorHandler();

    commandErrorHandler.setFallbackConsumer(
      (error, _command, [interaction, executionMeta]) => {
        this.consumeInteraction(interaction, error, executionMeta);
      },
    );
    clientEventErrorHandler.setFallbackConsumer(
      (error, _subscriber, [dispatchMeta]) => {
        this.consumeGeneric(error, dispatchMeta);
      },
    );
    scheduleErrorHandler.setFallbackConsumer((error, _schedule, [tickMeta]) => {
      this.consumeGeneric(error, tickMeta);
    });
    sessionStartErrorHandler.setFallbackConsumer(
      (error, session, [executionMeta]) => {
        this.consumeInteraction(
          session.getStartInteraction(),
          error,
          executionMeta,
        );
      },
    );
    sessionUpdateErrorHandler.setFallbackConsumer(
      (error, _session, [interaction, executionMeta]) => {
        this.consumeInteraction(interaction, error, executionMeta);
      },
    );
    sessionEndErrorHandler.setFallbackConsumer(
      (error, session, [_endData, executionMeta]) => {
        this.consumeInteraction(
          session.getStartInteraction(),
          error,
          executionMeta,
        );
      },
    );
  }

  public consumeGeneric(error: object, meta: Identifiable) {
    this.bot.getLogger().error(error);
    void this.agent.postGenericError(error as Error, String(meta.getId()));
  }

  public consumeInteraction(
    interaction: Interaction,
    error: object,
    meta: Identifiable,
  ) {
    this.bot.getLogger().error(error);
    void this.agent.handleError(interaction, error as Error, meta);
  }

  public async consumeWithLogEmbed(error: unknown, embed: EmbedBuilder) {
    this.bot.getLogger().error(error);
    await this.agent.postError(embed);
  }

  public async consumeWithErrorEmbeds(
    error: unknown,
    embeds: ErrorEmbedsData,
    interaction: RepliableInteraction,
  ) {
    this.bot.getLogger().error(error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embeds.user], components: [] });
      } else {
        await interaction.reply({ embeds: [embeds.user], ephemeral: true });
      }

      await this.agent.postError(embeds.log);
    } catch (e) {
      this.bot.getLogger().error('Fatal error while consuming error: ', e);
    }
  }
}
