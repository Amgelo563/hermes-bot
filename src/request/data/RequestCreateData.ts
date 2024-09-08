import type { RequestDataWithMember } from './RequestDataWithMember';

export type RequestCreateData = Omit<
  RequestDataWithMember,
  | 'id'
  | 'createdAt'
  | 'lastPostedAt'
  | 'channelId'
  | 'messageId'
  | 'tag'
  | 'guildId'
>;
