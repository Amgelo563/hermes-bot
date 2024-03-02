import type { Identifier } from '@nyx-discord/core';

import type { MessagePlaceholderManager } from './placeholder/MessagePlaceholderManager';
import type { MessageRepository } from './repository/MessageRepository';

export class MessageService<Context extends object> {
  protected readonly placeholderManager: MessagePlaceholderManager<Context>;

  protected readonly repository: MessageRepository;

  constructor(
    placeholder: MessagePlaceholderManager<Context>,
    repository: MessageRepository,
  ) {
    this.placeholderManager = placeholder;
    this.repository = repository;
  }

  public get<S extends object>(id: Identifier): S {
    return this.repository.getFromSource<S>(id);
  }

  public replace(message: string, context: Context): string {
    return this.placeholderManager.replace(message, context);
  }

  public getRepository(): MessageRepository {
    return this.repository;
  }

  public getPlaceholderManager(): MessagePlaceholderManager<Context> {
    return this.placeholderManager;
  }
}
