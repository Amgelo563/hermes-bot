import type { ServiceActionsCustomIdCodec } from '../../../service/action/codec/ServiceActionsCustomIdCodec';
import type { IdentifiableBlacklist } from '../../identity/IdentifiableBlacklist';
import type { BlacklistActionOptions } from '../BlacklistAction';

export type BlacklistActionsCustomIdCodec = ServiceActionsCustomIdCodec<
  IdentifiableBlacklist,
  BlacklistActionOptions
>;
