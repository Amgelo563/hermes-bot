import type { OfferSessionData } from '../../../bot/offer/sessions/OfferSessionData';
import type { HermesRequirement } from '../../../hermes/requirement/HermesRequirement';

export interface OfferSessionRequirement
  extends HermesRequirement<OfferSessionData> {}
