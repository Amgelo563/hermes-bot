import type { SessionStartInteraction } from '@nyx-discord/core';

import type { OfferCreateData } from '../../../service/offer/OfferCreateData';

export type OfferSessionData = {
  offer: OfferCreateData;
  interaction: SessionStartInteraction;
};
