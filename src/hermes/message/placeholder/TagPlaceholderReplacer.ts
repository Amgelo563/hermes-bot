import { DiscordDateFormatter } from '../../../format/DiscordDateFormatter';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { HermesPlaceholderContext } from '../context/HermesPlaceholderContext';
import type { HermesPlaceholderReplacer } from './abstract/HermesPlaceholderReplacer';

export class TagPlaceholderReplacer implements HermesPlaceholderReplacer {
  public replace(
    placeholder: MessagePlaceholder,
    context: HermesPlaceholderContext,
  ): string | null {
    const tag = context.services?.tag;

    if (!tag) return null;

    const [value, extra] = placeholder.values;

    switch (value) {
      case 'id':
        return String(tag.id);
      case 'name':
        return tag.name;
      case 'color':
        return tag.color;
      case 'description':
        return tag.description;
      case 'createdAt':
        return DiscordDateFormatter.format(tag.createdAt, extra);
      default:
        return null;
    }
  }

  public getNamespace(): string {
    return 'tag';
  }
}
