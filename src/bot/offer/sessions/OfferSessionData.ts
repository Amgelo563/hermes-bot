import type { SessionStartInteraction } from '@nyx-discord/core';
import type { OfferCreateData } from '../../../offer/data/OfferCreateData';

import type { HermesMember } from '../../../service/member/HermesMember';

export type OfferSessionData = {
  offer: OfferCreateData;
  member: HermesMember;
  interaction: SessionStartInteraction;
};
