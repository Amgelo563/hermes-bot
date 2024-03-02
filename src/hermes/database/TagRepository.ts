import type { NyxBot } from '@nyx-discord/core';
import { ObjectNotFoundError } from '@nyx-discord/core';
import { BasicEventBus } from '@nyx-discord/framework';
import type { PrismaClient } from '@prisma/client';

import type { ModelId } from '../../database/model/ModelId';
import type { TagCreateData } from '../../service/tag/TagCreateData';
import type { TagData } from '../../service/tag/TagData';
import { RepositoryEventEnum } from './event/RepositoryEvent';
import { AbstractCachedPrismaRepository } from './prisma/AbstractCachedPrismaRepository';

/** Repository for caching and querying tag data. */
export class TagRepository extends AbstractCachedPrismaRepository<TagData> {
  public static create(prisma: PrismaClient): TagRepository {
    const cache = new Map<ModelId<TagData>, TagData>();
    const bus = BasicEventBus.createAsync(
      {} as NyxBot,
      Symbol('TagRepository'),
    );

    return new TagRepository(prisma, bus, cache);
  }

  public async start(): Promise<void> {
    await this.findAll(true);
  }

  public async create(model: TagCreateData): Promise<TagData> {
    const tag = await this.prisma.tag.create({
      data: model,
    });

    this.cache.set(tag.id, tag);
    void this.bus.emit(RepositoryEventEnum.Create, [tag]);

    return tag;
  }

  public delete(id: ModelId<TagData>): Promise<TagData> {
    const tag = this.cache.get(id);
    if (!tag) {
      throw new ObjectNotFoundError();
    }

    this.invalidate(id);
    void this.bus.emit(RepositoryEventEnum.Remove, [tag]);

    return this.prisma.tag.delete({
      where: { id },
    });
  }

  public async exists(
    id: ModelId<TagData>,
    saveToCache = true,
  ): Promise<boolean> {
    const found = await this.find(id, saveToCache);
    return !!found;
  }

  public async find(
    id: ModelId<TagData>,
    saveToCache = true,
  ): Promise<TagData | null> {
    const cached = this.cache.get(id);

    if (cached) {
      return Promise.resolve(cached);
    }

    const tag = await this.prisma.tag.findUnique({ where: { id } });

    if (saveToCache && tag) {
      this.cache.set(id, tag);
    }

    return tag;
  }

  public async findAll(saveToCache = true): Promise<TagData[]> {
    const tags = await this.prisma.tag.findMany();

    if (!saveToCache) {
      return tags;
    }

    for (const tag of tags) {
      this.cache.set(tag.id, tag);
    }

    return tags;
  }

  public async update(
    where: ModelId<TagData>,
    model: Partial<TagData>,
    saveNewToCache = true,
  ): Promise<TagData> {
    this.invalidate(where);

    const updated = await this.prisma.tag.update({
      data: model,
      where: { id: where },
    });

    if (!saveNewToCache) return updated;

    this.cache.set(where, updated);

    void this.bus.emit(RepositoryEventEnum.Update, [updated]);

    return updated;
  }

  public get(id: ModelId<TagData>): TagData | null {
    const tag = this.cache.get(id);

    return tag ? tag : null;
  }

  public getTags(): TagData[] {
    return Array.from(this.cache.values()) as TagData[];
  }
}
