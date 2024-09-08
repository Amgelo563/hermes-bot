import type { OfferDataWithMember } from './OfferDataWithMember';

export type OfferCreateData = Omit<
  OfferDataWithMember,
  'id' | 'createdAt' | 'lastPostedAt' | 'channelId' | 'messageId' | 'guildId'
>;
