import type { Identifier } from '@nyx-discord/core';
import { AssertionError, ObjectNotFoundError } from '@nyx-discord/core';
import { ZodError } from 'zod';
import { ZodErrorFormatter } from '../../zod/ZodErrorFormatter';
import type { MessageSource } from '../source/MessageSource';

export class MessageRepository {
  protected readonly sources: Map<Identifier, MessageSource<object>>;

  protected readonly cache: Map<Identifier, object> = new Map();

  constructor(sources: Map<Identifier, MessageSource<object>>) {
    this.sources = sources;
  }

  public static create() {
    return new MessageRepository(new Map());
  }

  public addSource(source: MessageSource<object>) {
    this.sources.set(source.getId(), source);
  }

  public async fetchFromSource<T extends object>(
    identifier: Identifier,
  ): Promise<T> {
    if (!this.cache.has(identifier)) {
      const source = this.sources.get(identifier);
      if (!source) {
        throw new ObjectNotFoundError(
          `Source with id ${String(identifier)} not found`,
        );
      }

      try {
        const read = await source.read();
        this.cache.set(identifier, read);
      } catch (e) {
        if (e instanceof ZodError) {
          const formatted = ZodErrorFormatter.format(e);
          const json = JSON.stringify(formatted, null, 2);

          throw new AssertionError(
            `Validation error while reading message file "${source.getFilename()}"\n ${json}`,
          );
        }

        throw e;
      }
    }

    return this.cache.get(identifier) as T;
  }

  public getFromSource<T extends object>(identifier: Identifier): T {
    const cached = this.cache.get(identifier) as T | undefined;
    if (!cached) {
      throw new ObjectNotFoundError(
        `Cached message config with id ${String(identifier)} not found`,
      );
    }

    return cached;
  }

  public getSources(): ReadonlyMap<Identifier, MessageSource<object>> {
    return this.sources;
  }
}
