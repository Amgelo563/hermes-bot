import type { Model } from '../../../database/model/Model';

/** Enum of possible repository events. */
export const RepositoryEventEnum = {
  Create: 'create',
  Remove: 'remove',
  Update: 'update',
} as const;

/** Type of values of {@link RepositoryEventEnum}. */
export type RepositoryEventType =
  (typeof RepositoryEventEnum)[keyof typeof RepositoryEventEnum];

/** Record of arguments for each command event. */
export interface RepositoryEventArgs<RepoModel extends Model> {
  create: [RepoModel];
  remove: [RepoModel];
  update: [RepoModel];
}
