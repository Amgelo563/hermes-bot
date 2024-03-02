import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { IdentifiableOffer } from '../identity/IdentifiableOffer';

export interface OfferActionExecutor
  extends ServiceActionExecutor<IdentifiableOffer> {}
