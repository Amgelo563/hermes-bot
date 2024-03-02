import type { ExtractedMessagePlaceholder } from './ExtractedMessagePlaceholder';
import type { MessagePlaceholderExtractor } from './MessagePlaceholderExtractor';

export class DefaultMessagePlaceholderExtractor
  implements MessagePlaceholderExtractor
{
  // Searches for %placeholders% that start and end with only one %, and inside %placeholders% there can
  // be underscores, but not at the start or end.
  protected static readonly DefaultRegex =
    /(?<!%)%([a-zA-Z0-9_.:]+)(?<!_)%(?!%)/gm;

  protected readonly regex: RegExp;

  constructor(regex: RegExp) {
    this.regex = regex;
  }

  public static create(): DefaultMessagePlaceholderExtractor {
    return new DefaultMessagePlaceholderExtractor(
      DefaultMessagePlaceholderExtractor.DefaultRegex,
    );
  }

  public extract(message: string): ExtractedMessagePlaceholder[] {
    let matches = Array.from(message.matchAll(this.regex));
    if (!matches) {
      return [];
    }

    const found: string[] = [];
    matches = matches.filter((match) => {
      if (found.includes(match[0])) {
        return false;
      }

      found.push(match[0]);
      return true;
    });

    const placeholders: ExtractedMessagePlaceholder[] = [];

    for (const match of matches) {
      const [original, placeholder] = match;

      if (!placeholder) {
        continue;
      }

      const [namespace, ...values] = placeholder.split('_');

      placeholders.push({
        namespace,
        values,
        original,
      });
    }

    return placeholders;
  }

  public escape(message: string): string {
    return message.replaceAll('%', '%%');
  }
}
