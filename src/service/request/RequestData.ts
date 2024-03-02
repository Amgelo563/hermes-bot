import type { TagData } from '../tag/TagData';

export type RequestData = {
  id: number;

  title: string;
  description: string;
  budget: string;

  createdAt: Date;
  lastPostedAt: Date;

  userId: string;

  guildId: string;
  channelId: string;
  messageId: string;

  tagId: number;
  tag: TagData;
};
