import type { NyxBot } from '@nyx-discord/core';
import { BasicEventBus } from '@nyx-discord/framework';
import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { Message } from 'discord.js';
import { LRUCache } from 'lru-cache';
import type { ModelId } from '../../database/model/ModelId';
import { AbstractCachedPrismaRepository } from '../../hermes/database/prisma/AbstractCachedPrismaRepository';
import type { OmitId } from '../../types/OmitId';
import type { RequestData } from '../data/RequestData';

/** Repository for caching and querying request data. */
export class RequestRepository extends AbstractCachedPrismaRepository<RequestData> {
  public static create(prisma: PrismaClient): RequestRepository {
    const cache = new LRUCache<ModelId<RequestData>, RequestData>({
      max: 1000,
      allowStale: false,
    }) as LRUCache<ModelId<RequestData>, RequestData> & {
      values(): Generator<RequestData | undefined>;
    };
    const bus = BasicEventBus.createAsync(
      {} as NyxBot,
      Symbol('RequestRepository'),
    );

    return new RequestRepository(prisma, bus, cache);
  }

  public async create(
    model: OmitId<RequestData>,
    saveToCache?: boolean,
  ): Promise<RequestData> {
    const request = await this.prisma.request.create({
      data: {
        ...model,
        tagId: undefined,
        tag:
          model.tagId === null ? undefined : { connect: { id: model.tagId } },
      },
      include: {
        tag: true,
      },
    });

    if (saveToCache) {
      this.cache.set(request.id, request);
    }

    return request;
  }

  public delete(id: ModelId<RequestData>): Promise<RequestData> {
    this.invalidate(id);

    return this.prisma.request.delete({
      where: { id },
      include: {
        tag: true,
      },
    });
  }

  public async exists(
    id: ModelId<RequestData>,
    saveToCache?: boolean,
  ): Promise<boolean> {
    const found = await this.find(id, saveToCache);
    return !!found;
  }

  public async find(
    id: ModelId<RequestData>,
    saveToCache?: boolean,
  ): Promise<RequestData | null> {
    const cached = this.cache.get(id);

    if (cached) {
      return cached;
    }

    const request = await this.prisma.request.findUnique({
      where: { id },
      include: { tag: true },
    });

    if (saveToCache && request) {
      this.cache.set(id, request);
    }

    return request;
  }

  public async findAll(
    max?: number,
    saveToCache?: boolean,
  ): Promise<RequestData[]> {
    const data = await this.prisma.request.findMany({
      include: { tag: true },
      orderBy: { createdAt: Prisma.SortOrder.asc },
      take: max,
    });

    if (!saveToCache) {
      return data;
    }

    for (const request of data) {
      this.cache.set(request.id, request);
    }

    return data;
  }

  public async update(
    where: ModelId<RequestData>,
    data: Partial<RequestData>,
    saveNewToCache?: boolean,
  ): Promise<RequestData> {
    const updated = await this.prisma.request.update({
      where: {
        id: where,
      },
      data: {
        ...data,
        tag: undefined,
      },
      include: {
        tag: true,
      },
    });

    if (!saveNewToCache) return updated;

    this.cache.set(where, updated);

    return updated;
  }

  public async fetchFrom(
    memberId: string,
    max: number,
  ): Promise<RequestData[]> {
    const requests = this.prisma.request.findMany({
      where: {
        memberId,
      },
      include: {
        tag: true,
      },
      orderBy: { lastPostedAt: Prisma.SortOrder.asc },
      take: max,
    });

    for (const request of await requests) {
      this.cache.set(request.id, request);
    }

    return requests;
  }

  public async updateRepost(
    where: ModelId<RequestData>,
    newPost: Message,
    saveToCache = true,
  ): Promise<RequestData> {
    this.invalidate(where);

    const guildId = newPost.guildId as string;
    const newRequest = await this.prisma.request.update({
      where: {
        id: where,
      },
      data: {
        messageId: newPost.id,
        channelId: newPost.channelId,
        guildId,
        lastPostedAt: newPost.createdAt,
        postsAmount: {
          increment: 1,
        },
      },
      include: { tag: true },
    });

    if (saveToCache) {
      this.cache.set(newRequest.id, newRequest);
    }

    return newRequest;
  }

  public async findUpTo(
    amount: number,
    addToCache = true,
  ): Promise<RequestData[]> {
    const found = await this.prisma.request.findMany({
      take: amount,
      orderBy: { lastPostedAt: Prisma.SortOrder.asc },
      include: { tag: true },
    });

    if (addToCache) {
      for (const request of found) {
        this.cache.set(request.id, request);
      }
    }

    return found;
  }
}
