import type { Identifiable, NyxBot } from '@nyx-discord/core';
import type { Interaction } from 'discord.js';
import type { DiscordServiceAgent } from '../service/discord/DiscordServiceAgent';

export class HermesBotErrorAgent {
  protected readonly agent: DiscordServiceAgent;

  protected readonly bot: NyxBot;

  constructor(bot: NyxBot, agent: DiscordServiceAgent) {
    this.bot = bot;
    this.agent = agent;
  }

  public static create(bot: NyxBot, agent: DiscordServiceAgent) {
    return new HermesBotErrorAgent(bot, agent);
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
        this.consume(error, dispatchMeta);
      },
    );
    scheduleErrorHandler.setFallbackConsumer((error, _schedule, [tickMeta]) => {
      this.consume(error, tickMeta);
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

  public consume(error: object, meta: Identifiable) {
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
}
