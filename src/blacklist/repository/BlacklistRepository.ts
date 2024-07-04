import type { NyxBot } from '@nyx-discord/core';
import { BasicEventBus } from '@nyx-discord/framework';
import type { PrismaClient } from '@prisma/client';
import { LRUCache } from 'lru-cache';

import type { ModelId } from '../../database/model/ModelId';
import { AbstractCachedPrismaRepository } from '../../hermes/database/prisma/AbstractCachedPrismaRepository';
import type { BlacklistData } from '../data/BlacklistData';

export class BlacklistRepository extends AbstractCachedPrismaRepository<BlacklistData> {
  public static create(prisma: PrismaClient): BlacklistRepository {
    const cache = new LRUCache<ModelId<BlacklistData>, BlacklistData>({
      max: 1000,
      allowStale: false,
    }) as LRUCache<ModelId<BlacklistData>, BlacklistData> & {
      values(): Generator<BlacklistData | undefined>;
    };
    const bus = BasicEventBus.createAsync(
      {} as NyxBot,
      Symbol('BlacklistRepository'),
    );

    return new BlacklistRepository(prisma, bus, cache);
  }

  public async create(
    model: BlacklistData,
    saveToCache = true,
  ): Promise<BlacklistData> {
    const blacklist = await this.prisma.blacklist.create({
      data: {
        ...model,
      },
    });

    if (saveToCache) {
      this.cache.set(blacklist.id, blacklist);
    }

    return blacklist;
  }

  public delete(id: ModelId<BlacklistData>): Promise<unknown> {
    this.invalidate(id);

    return this.prisma.blacklist.delete({
      where: { id },
    });
  }

  public async exists(
    id: ModelId<BlacklistData>,
    saveToCache = true,
  ): Promise<boolean> {
    const found = await this.find(id, saveToCache);
    return !!found;
  }

  public async find(
    id: ModelId<BlacklistData>,
    saveToCache = true,
  ): Promise<BlacklistData | null> {
    const cached = this.cache.get(id);
    if (cached) {
      return cached;
    }

    const blacklist = await this.prisma.blacklist.findUnique({
      where: { id },
    });

    if (saveToCache && blacklist) {
      this.cache.set(id, blacklist);
    }

    return blacklist;
  }

  public async findAll(
    max?: number,
    saveToCache = false,
  ): Promise<BlacklistData[]> {
    const blacklists = await this.prisma.blacklist.findMany({
      take: max,
      orderBy: { createdAt: 'asc' },
    });

    if (!saveToCache) {
      return blacklists;
    }

    for (const blacklist of blacklists) {
      this.cache.set(blacklist.id, blacklist);
    }

    return blacklists;
  }

  public async update(
    where: ModelId<BlacklistData>,
    model: Partial<BlacklistData>,
    saveToCache = true,
  ): Promise<BlacklistData> {
    this.invalidate(where);

    const newBlacklist = await this.prisma.blacklist.update({
      where: { id: where },
      data: model,
    });

    if (saveToCache) {
      this.cache.set(newBlacklist.id, newBlacklist);
    }

    return newBlacklist;
  }

  public async findAllExpired(saveToCache = false): Promise<BlacklistData[]> {
    const blacklists = await this.prisma.blacklist.findMany({
      where: { expiresAt: { lte: new Date() } },
      orderBy: { createdAt: 'asc' },
    });

    if (!saveToCache) {
      return blacklists;
    }

    for (const blacklist of blacklists) {
      this.cache.set(blacklist.id, blacklist);
    }

    return blacklists;
  }
}
