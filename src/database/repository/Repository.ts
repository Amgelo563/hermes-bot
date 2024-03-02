import type { OmitId } from '../../types/OmitId';
import type { Model } from '../model/Model';
import type { ModelId } from '../model/ModelId';

export interface Repository<RepoModel extends Model> {
  find(id: ModelId<RepoModel>): Promise<RepoModel | null>;

  findAll(): Promise<RepoModel[]>;

  exists(id: ModelId<RepoModel>): Promise<boolean>;

  create(model: OmitId<RepoModel>): Promise<RepoModel>;

  delete(id: ModelId<RepoModel>): Promise<unknown>;

  update(
    where: ModelId<RepoModel>,
    data: Partial<RepoModel>,
  ): Promise<RepoModel>;
}
