import type { ServiceActionsCustomIdCodec } from '../../../service/action/codec/ServiceActionsCustomIdCodec';
import type { IdentifiableRequest } from '../identity/IdentifiableRequest';
import type { RequestActionOptions } from '../RequestAction';

export type RequestActionsCustomIdCodec = ServiceActionsCustomIdCodec<
  IdentifiableRequest,
  RequestActionOptions
>;
