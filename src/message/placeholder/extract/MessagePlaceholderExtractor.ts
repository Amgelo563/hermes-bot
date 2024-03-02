import type { ExtractedMessagePlaceholder } from './ExtractedMessagePlaceholder';

export interface MessagePlaceholderExtractor {
  extract(message: string): ExtractedMessagePlaceholder[];

  escape(message: string): string;
}
