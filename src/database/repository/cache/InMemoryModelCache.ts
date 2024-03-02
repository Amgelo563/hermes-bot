import type { Model } from '../../model/Model';
import type { ModelId } from '../../model/ModelId';

export interface InMemoryModelCache<RepoModel extends Model> {
  get(id: ModelId<RepoModel>): RepoModel | null | undefined;

  set(id: ModelId<RepoModel>, model: RepoModel): void;

  delete(id: ModelId<RepoModel>): void;

  has(id: ModelId<RepoModel>): boolean;

  values():
    | Generator<RepoModel | undefined>
    | IterableIterator<RepoModel | undefined>;

  clear(): void;
}
