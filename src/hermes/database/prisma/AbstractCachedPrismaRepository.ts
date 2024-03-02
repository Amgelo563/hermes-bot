import type { EventBus } from '@nyx-discord/core';
import type { PrismaClient } from '@prisma/client';

import type { Model } from '../../../database/model/Model';
import type { ModelId } from '../../../database/model/ModelId';
import type { CachedRepository } from '../../../database/repository/cache/CachedRepository';
import type { InMemoryModelCache } from '../../../database/repository/cache/InMemoryModelCache';
import type { RepositoryEventArgs } from '../event/RepositoryEvent';
import { AbstractPrismaRepository } from './AbstractPrismaRepository';

export abstract class AbstractCachedPrismaRepository<RepoModel extends Model>
  extends AbstractPrismaRepository<RepoModel>
  implements CachedRepository<RepoModel>
{
  protected readonly cache: InMemoryModelCache<RepoModel>;

  constructor(
    prisma: PrismaClient,
    bus: EventBus<RepositoryEventArgs<RepoModel>>,
    cache: InMemoryModelCache<RepoModel>,
  ) {
    super(prisma, bus);
    this.cache = cache;
  }

  public invalidate(id: ModelId<RepoModel>): void {
    this.cache.delete(id);
  }

  public saveToCache(model: RepoModel): void {
    this.cache.set(model.id as ModelId<RepoModel>, model);
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  protected findInCache(
    callback: (value: RepoModel) => boolean,
    max?: number,
  ): RepoModel[] {
    const result: RepoModel[] = [];

    for (const value of this.cache.values()) {
      if (max && result.length >= max) break;
      if (!value) continue;

      if (callback(value)) {
        result.push(value);
      }
    }

    return result;
  }
}
