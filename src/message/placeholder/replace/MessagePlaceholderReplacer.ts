import type { MessagePlaceholder } from '../MessagePlaceholder';

export interface MessagePlaceholderReplacer<Context extends object> {
  replace(placeholder: MessagePlaceholder, context: Context): string | null;

  getNamespace(): string;
}
