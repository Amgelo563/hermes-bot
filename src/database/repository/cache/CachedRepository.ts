import type { Model } from '../../model/Model';
import type { ModelId } from '../../model/ModelId';
import type { Repository } from '../Repository';

export interface CachedRepository<RepoModel extends Model>
  extends Repository<RepoModel> {
  invalidate(id: ModelId<RepoModel>): void;
}
