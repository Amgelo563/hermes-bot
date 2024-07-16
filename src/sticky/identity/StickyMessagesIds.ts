export const StickyMessageIdEnum = {
  Offer: 'offer',
  Request: 'request',
} as const;

export type StickyMessageIdType =
  (typeof StickyMessageIdEnum)[keyof typeof StickyMessageIdEnum];
