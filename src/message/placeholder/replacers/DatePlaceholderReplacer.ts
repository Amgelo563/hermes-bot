import { DiscordDateFormatter } from '../../../format/DiscordDateFormatter';
import type { MessagePlaceholder } from '../MessagePlaceholder';
import type { MessagePlaceholderReplacer } from '../replace/MessagePlaceholderReplacer';

export class DatePlaceholderReplacer
  implements MessagePlaceholderReplacer<object>
{
  public replace(placeholder: MessagePlaceholder): string | null {
    const format = placeholder.values[0];
    if (!format) return null;

    return DiscordDateFormatter.format(new Date(), format);
  }

  public getNamespace(): string {
    return 'date';
  }
}
