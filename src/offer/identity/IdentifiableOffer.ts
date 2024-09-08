import type { Identifiable } from '@nyx-discord/core';

import type { OfferDataWithMember } from '../data/OfferDataWithMember';

export interface IdentifiableOffer
  extends Identifiable<string>,
    OfferDataWithMember {}

export function createIdentifiableOffer(
  offer: OfferDataWithMember,
): IdentifiableOffer {
  return {
    ...offer,
    getId(): string {
      return offer.id.toString();
    },
  };
}
