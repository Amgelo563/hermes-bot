import type { OfferData } from './OfferData';

export type OfferCreateData = Omit<
  OfferData,
  'id' | 'createdAt' | 'lastPostedAt' | 'channelId' | 'messageId' | 'guildId'
>;
