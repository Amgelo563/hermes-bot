import type { RequestData } from './RequestData';

export type RequestCreateData = Omit<
  RequestData,
  | 'id'
  | 'createdAt'
  | 'lastPostedAt'
  | 'channelId'
  | 'messageId'
  | 'tag'
  | 'guildId'
>;
