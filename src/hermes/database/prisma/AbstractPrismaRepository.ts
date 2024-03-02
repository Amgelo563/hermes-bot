import type { EventBus } from '@nyx-discord/core';
import type { PrismaClient } from '@prisma/client';

import type { Model } from '../../../database/model/Model';
import type { ModelId } from '../../../database/model/ModelId';
import type { Repository } from '../../../database/repository/Repository';
import type { OmitId } from '../../../types/OmitId';
import type { RepositoryEventArgs } from '../event/RepositoryEvent';

export abstract class AbstractPrismaRepository<RepoModel extends Model>
  implements Repository<RepoModel>
{
  protected readonly bus: EventBus<RepositoryEventArgs<RepoModel>>;

  protected readonly prisma: PrismaClient;

  constructor(
    prisma: PrismaClient,
    bus: EventBus<RepositoryEventArgs<RepoModel>>,
  ) {
    this.prisma = prisma;
    this.bus = bus;
  }

  public abstract create(model: OmitId<RepoModel>): Promise<RepoModel>;

  public abstract exists(id: ModelId<RepoModel>): Promise<boolean>;

  public abstract find(id: ModelId<RepoModel>): Promise<RepoModel | null>;

  public abstract update(
    where: ModelId<RepoModel>,
    model: Partial<RepoModel>,
  ): Promise<RepoModel>;

  public abstract findAll(): Promise<RepoModel[]>;

  public abstract delete(id: ModelId<RepoModel>): Promise<unknown>;

  public getBus(): EventBus<RepositoryEventArgs<RepoModel>> {
    return this.bus;
  }
}
