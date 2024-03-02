import type { MessagePlaceholder } from '../MessagePlaceholder';

export type ExtractedMessagePlaceholder = MessagePlaceholder & {
  original: string;
};
