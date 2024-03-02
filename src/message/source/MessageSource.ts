import type { Identifiable } from '@nyx-discord/core';
import type { Awaitable } from 'discord.js';

export interface MessageSource<T extends object> extends Identifiable {
  read(): Awaitable<T>;

  getFilename(): string;
}
