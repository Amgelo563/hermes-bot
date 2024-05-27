import type { OfferSessionData } from '../../../bot/offer/sessions/OfferSessionData';
import type { HermesRequirementFactory } from '../../../hermes/requirement/HermesRequirementFactory';

export interface OfferSessionRequirementFactory
  extends HermesRequirementFactory<OfferSessionData> {}
