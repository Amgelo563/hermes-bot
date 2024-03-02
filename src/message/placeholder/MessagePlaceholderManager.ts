import { IllegalDuplicateError } from '@nyx-discord/core';
import type { EphemeralPlaceholderContext } from './context/EphemeralPlaceholderContext';
import { DefaultMessagePlaceholderExtractor } from './extract/DefaultMessagePlaceholderExtractor';
import type { MessagePlaceholderExtractor } from './extract/MessagePlaceholderExtractor';
import type { MessagePlaceholder } from './MessagePlaceholder';
import type { MessagePlaceholderReplacer } from './replace/MessagePlaceholderReplacer';

export class MessagePlaceholderManager<Context extends object> {
  protected readonly extractor: MessagePlaceholderExtractor;

  protected readonly replacers: Map<
    string,
    MessagePlaceholderReplacer<Context>
  >;

  constructor(
    extractor: MessagePlaceholderExtractor,
    replacers: Map<string, MessagePlaceholderReplacer<Context>>,
  ) {
    this.extractor = extractor;
    this.replacers = replacers;
  }

  public static create<Context extends object>() {
    const extractor = DefaultMessagePlaceholderExtractor.create();

    return new MessagePlaceholderManager<Context>(extractor, new Map());
  }

  public async start() {
    // Nothing by default
  }

  public replace(
    message: string,
    context: Context,
    ephemeralContext?: EphemeralPlaceholderContext,
  ): string {
    const placeholders = this.extractor.extract(message);

    if (!placeholders.length) {
      return message;
    }

    let newMessage = message;

    for (const placeholder of placeholders) {
      const result = this.replacePlaceholder(
        placeholder,
        context,
        ephemeralContext,
      );
      if (!result) continue;

      newMessage = newMessage.replaceAll(
        new RegExp(placeholder.original, 'g'),
        () => result,
      );
    }

    return newMessage;
  }

  public replacePlaceholder(
    placeholder: MessagePlaceholder,
    context: Context,
    ephemeralContext?: EphemeralPlaceholderContext,
  ): string | null {
    const replacer = this.replacers.get(placeholder.namespace);

    if (!replacer) {
      if (!ephemeralContext) {
        return null;
      }

      const key = Object.keys(ephemeralContext).find(
        (k) => k === placeholder.namespace,
      );

      if (!key) return null;

      return ephemeralContext[key];
    }

    return replacer.replace(placeholder, context);
  }

  public addReplacer(replacer: MessagePlaceholderReplacer<Context>) {
    const namespace = replacer.getNamespace();

    const originalReplacer = this.replacers.get(namespace);
    if (originalReplacer) {
      throw new IllegalDuplicateError(originalReplacer, replacer);
    }

    this.replacers.set(namespace, replacer);
  }

  public addReplacers(replacers: MessagePlaceholderReplacer<Context>[]) {
    for (const replacer of replacers) {
      this.addReplacer(replacer);
    }
  }

  public escapePlaceholders(text: string): string {
    return this.extractor.escape(text);
  }
}
