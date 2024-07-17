import { ObjectNotFoundError } from '@nyx-discord/core';
import { BasicEventBus } from '@nyx-discord/framework';
import type { PrismaClient } from '@prisma/client';

import type { ModelId } from '../../database/model/ModelId';
import { RepositoryEventEnum } from '../../hermes/database/event/RepositoryEvent';
import { AbstractCachedPrismaRepository } from '../../hermes/database/prisma/AbstractCachedPrismaRepository';
import type { StickyMessageData } from '../data/StickyMessageData';
import type { StickyMessageIdType } from '../identity/StickyMessagesIds';

export class StickyMessagesRepository extends AbstractCachedPrismaRepository<StickyMessageData> {
  public static create(prisma: PrismaClient): StickyMessagesRepository {
    const cache = new Map<ModelId<StickyMessageData>, StickyMessageData>();
    const bus = BasicEventBus.createAsync(
      null,
      Symbol('StickyMessageRepository'),
    );

    return new StickyMessagesRepository(prisma, bus, cache);
  }

  public async start(): Promise<void> {
    await this.findAll(true);
  }

  public async create(model: StickyMessageData): Promise<StickyMessageData> {
    const message = await this.prisma.stickyMessage.upsert({
      create: model,
      update: model,
      where: {
        id: model.id,
      },
    });

    this.cache.set(message.id, message);
    void this.bus.emit(RepositoryEventEnum.Create, [message]);

    return message;
  }

  public delete(id: ModelId<StickyMessageData>): Promise<StickyMessageData> {
    const message = this.cache.get(id);
    if (!message) {
      throw new ObjectNotFoundError();
    }

    this.invalidate(id);
    void this.bus.emit(RepositoryEventEnum.Remove, [message]);

    return this.prisma.stickyMessage.delete({
      where: { id },
    });
  }

  public async exists(
    id: ModelId<StickyMessageData>,
    saveToCache = true,
  ): Promise<boolean> {
    const found = await this.find(id, saveToCache);
    return !!found;
  }

  public async find(
    id: ModelId<StickyMessageData>,
    saveToCache = true,
  ): Promise<StickyMessageData | null> {
    const cached = this.cache.get(id);

    if (cached) {
      return Promise.resolve(cached);
    }

    const message = await this.prisma.stickyMessage.findUnique({
      where: { id },
    });

    if (saveToCache && message) {
      this.cache.set(id, message);
    }

    return message;
  }

  public async findAll(saveToCache = true): Promise<StickyMessageData[]> {
    const messages = await this.prisma.stickyMessage.findMany();

    if (!saveToCache) {
      return messages;
    }

    for (const message of messages) {
      this.cache.set(message.id, message);
    }

    return messages;
  }

  public async update(
    where: ModelId<StickyMessageData>,
    model: Partial<StickyMessageData>,
    saveNewToCache = true,
  ): Promise<StickyMessageData> {
    this.invalidate(where);

    const updated = await this.prisma.stickyMessage.update({
      data: model,
      where: { id: where },
    });

    if (!saveNewToCache) return updated;

    this.cache.set(where, updated);

    void this.bus.emit(RepositoryEventEnum.Update, [updated]);

    return updated;
  }

  public get(id: StickyMessageIdType): StickyMessageData | null {
    const message = this.cache.get(id);

    return message ?? null;
  }
}
