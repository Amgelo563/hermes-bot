import type { NyxBot } from '@nyx-discord/core';
import { BasicEventBus } from '@nyx-discord/framework';
import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { Message } from 'discord.js';
import { LRUCache } from 'lru-cache';

import type { ModelId } from '../../database/model/ModelId';
import { AbstractCachedPrismaRepository } from '../../hermes/database/prisma/AbstractCachedPrismaRepository';
import type { TagData } from '../../tag/data/TagData';
import type { OmitId } from '../../types/OmitId';
import type { OfferData } from '../data/OfferData';

/** Repository for caching and querying offer data. */
export class OfferRepository extends AbstractCachedPrismaRepository<OfferData> {
  public static create(prisma: PrismaClient): OfferRepository {
    const cache = new LRUCache<ModelId<OfferData>, OfferData>({
      max: 1000,
      allowStale: false,
    }) as LRUCache<ModelId<OfferData>, OfferData> & {
      values(): Generator<OfferData | undefined>;
    };
    const bus = BasicEventBus.createAsync(
      {} as NyxBot,
      Symbol('OfferRepository'),
    );

    return new OfferRepository(prisma, bus, cache);
  }

  public async create(
    model: OmitId<OfferData>,
    saveToCache = true,
  ): Promise<OfferData> {
    const offer = await this.prisma.offer.create({
      data: {
        ...model,
        tags: {
          connect: model.tags.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    });

    if (saveToCache) {
      this.cache.set(offer.id, offer);
    }

    return offer;
  }

  public delete(id: ModelId<OfferData>): Promise<OfferData> {
    this.invalidate(id);

    return this.prisma.offer.delete({
      where: { id },
      include: {
        tags: true,
      },
    });
  }

  public async exists(
    id: ModelId<OfferData>,
    saveToCache = true,
  ): Promise<boolean> {
    const found = await this.find(id, saveToCache);
    return !!found;
  }

  public async find(
    id: ModelId<OfferData>,
    saveToCache = true,
  ): Promise<OfferData | null> {
    const cached = this.cache.get(id);

    if (cached) {
      return cached;
    }

    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (saveToCache && offer) {
      this.cache.set(id, offer);
    }

    return offer;
  }

  public async findAll(
    max?: number,
    saveToCache = false,
  ): Promise<OfferData[]> {
    const offers = await this.prisma.offer.findMany({
      include: { tags: true },
      take: max,
      orderBy: { lastPostedAt: Prisma.SortOrder.asc },
    });

    if (!saveToCache) {
      return offers;
    }

    for (const offer of offers) {
      this.cache.set(offer.id, offer);
    }

    return offers;
  }

  public findNWithTag(
    tagId: ModelId<TagData>,
    n: number,
  ): Promise<OfferData[]> {
    return this.prisma.offer.findMany({
      where: {
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      take: n,
      include: { tags: true },
      orderBy: { lastPostedAt: Prisma.SortOrder.asc },
    });
  }

  public async fetchFrom(
    memberId: string,
    max: number,
    saveToCache = true,
  ): Promise<OfferData[]> {
    const offers = await this.prisma.offer.findMany({
      where: { memberId },
      include: { tags: true },
      take: max,
      orderBy: {
        lastPostedAt: Prisma.SortOrder.asc,
      },
    });

    if (!offers.length) {
      return [];
    }

    if (saveToCache) {
      for (const offer of offers) {
        this.cache.set(offer.id, offer);
      }
    }

    return offers;
  }

  public async update(
    where: ModelId<OfferData>,
    model: Partial<OfferData>,
    saveToCache = true,
  ): Promise<OfferData> {
    this.invalidate(where);

    const newOffer = await this.prisma.offer.update({
      where: { id: where },
      data: {
        ...model,
        tags: {
          set: model.tags?.map((tag) => ({ id: tag.id })),
        },
      },
      include: { tags: true },
    });

    if (saveToCache) {
      this.cache.set(newOffer.id, newOffer);
    }

    return newOffer;
  }

  public async updateRepost(
    where: ModelId<OfferData>,
    newPost: Message,
    saveToCache = true,
  ): Promise<OfferData> {
    this.invalidate(where);

    const guildId = newPost.guildId as string;
    const newOffer = await this.prisma.offer.update({
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
      include: { tags: true },
    });

    if (saveToCache) {
      this.cache.set(newOffer.id, newOffer);
    }

    return newOffer;
  }
}
