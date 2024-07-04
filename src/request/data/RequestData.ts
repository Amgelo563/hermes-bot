import type { TagData } from '../../tag/data/TagData';

export type RequestData = {
  id: number;

  title: string;
  description: string;
  budget: string;

  createdAt: Date;
  lastPostedAt: Date;

  memberId: string;

  guildId: string;
  channelId: string;
  messageId: string;

  tagId: number | null;
  tag: TagData | null;
};
