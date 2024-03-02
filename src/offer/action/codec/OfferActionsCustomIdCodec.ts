import type { ServiceActionsCustomIdCodec } from '../../../service/action/codec/ServiceActionsCustomIdCodec';
import type { IdentifiableOffer } from '../identity/IdentifiableOffer';
import type { OfferActionOptions } from '../OfferAction';

export type OfferActionsCustomIdCodec = ServiceActionsCustomIdCodec<
  IdentifiableOffer,
  OfferActionOptions
>;
