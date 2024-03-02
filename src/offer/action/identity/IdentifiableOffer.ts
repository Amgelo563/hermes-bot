import type { Identifiable } from '@nyx-discord/core';
import type { OfferData } from '../../../service/offer/OfferData';

export interface IdentifiableOffer extends Identifiable<string>, OfferData {}

export function createIdentifiableOffer(offer: OfferData): IdentifiableOffer {
  return {
    ...offer,
    getId(): string {
      return offer.id.toString();
    },
  };
}
