import type { NyxLogger } from '@nyx-discord/core';
import type { Awaitable } from 'discord.js';

export class Debouncer {
  protected readonly delay: number;

  protected readonly logger: NyxLogger;

  protected readonly callback: () => Awaitable<any>;

  protected timeoutId: NodeJS.Timeout | null = null;

  constructor(
    callback: () => Awaitable<any>,
    delay: number,
    logger: NyxLogger,
  ) {
    this.callback = callback;
    this.delay = delay;
    this.logger = logger;
  }

  public debounce() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      (async () => {
        await this.callback();
        this.timeoutId = null;
      })().catch((e) => {
        this.logger.error('Error after executing debounced callback', e);
      });
    }, this.delay);
  }
}
