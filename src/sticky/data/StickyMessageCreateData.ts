import type { StickyMessageData } from './StickyMessageData';

export type StickyMessageCreateData = Omit<StickyMessageData, 'messageId'>;
