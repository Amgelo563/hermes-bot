import { ArrayFormatter } from '../../../format/ArrayFormatter';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { HermesPlaceholderReplacer } from './HermesPlaceholderReplacer';

export abstract class AbstractObjectPlaceholderReplacer
  implements HermesPlaceholderReplacer
{
  protected abstract readonly object: object;

  public replace(placeholder: MessagePlaceholder): string | null {
    const arg = placeholder.values[0];
    if (!arg) return null;

    const value = this.extract(this.object, arg);
    if (value === undefined) {
      return null;
    }
    if (Array.isArray(value)) {
      return ArrayFormatter.format(value, placeholder.values.slice(1));
    }

    return String(value);
  }

  public abstract getNamespace(): string;

  protected extract<T>(obj: T, path: string): unknown {
    const pathParts = path.split('.');
    let result: unknown = obj;

    for (const part of pathParts) {
      if (typeof result === 'object' && result !== null && part in result) {
        result = (result as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return result;
  }
}
