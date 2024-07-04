import type { TagData } from '../../tag/data/TagData';

export type OfferData = {
  id: number;

  title: string;
  description: string;
  price: string;

  createdAt: Date;
  lastPostedAt: Date;

  memberId: string;

  guildId: string;
  channelId: string;
  messageId: string;

  thumbnail: string;
  image: string;

  tags: TagData[];
};
