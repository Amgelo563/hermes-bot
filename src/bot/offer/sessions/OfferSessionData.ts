import type { SessionStartInteraction } from '@nyx-discord/core';

import type { HermesMember } from '../../../service/member/HermesMember';
import type { OfferCreateData } from '../../../service/offer/OfferCreateData';

export type OfferSessionData = {
  offer: OfferCreateData;
  member: HermesMember;
  interaction: SessionStartInteraction;
};
