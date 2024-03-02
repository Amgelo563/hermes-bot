import type { ServiceActionsCustomIdCodec } from '../../../service/action/codec/ServiceActionsCustomIdCodec';
import type { IdentifiableTag } from '../identity/IdentifiableTag';
import type { TagActionOptions } from '../TagAction';

export type TagActionsCustomIdCodec = ServiceActionsCustomIdCodec<
  IdentifiableTag,
  TagActionOptions
>;
