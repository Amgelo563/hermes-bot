import { ArrayFormatter } from '../../../format/ArrayFormatter';
import { HermesMemberFormatter } from '../../../format/HermesMemberFormatter';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { HermesPlaceholderContext } from '../context/HermesPlaceholderContext';
import type { HermesPlaceholderReplacer } from './abstract/HermesPlaceholderReplacer';

export class UpdatePlaceholderReplacer implements HermesPlaceholderReplacer {
  public getNamespace(): string {
    return 'update';
  }

  public replace(
    placeholder: MessagePlaceholder,
    context: HermesPlaceholderContext,
  ): string | null {
    const { update } = context;
    if (!update) return null;

    const [requested, arg] = placeholder.values;
    if (!requested) return null;

    switch (requested) {
      case 'new':
        return this.extract(update.new, arg, placeholder);
      case 'old':
        return this.extract(update.old, arg, placeholder);
      case 'updater': {
        if (!arg) return null;

        return HermesMemberFormatter.format(update.updater, arg);
      }
      case 'affected': {
        if (!placeholder.values[1]) return null;

        return HermesMemberFormatter.format(update.affected, arg);
      }
      default:
        return null;
    }
  }

  protected extract<T>(
    obj: T,
    path: string,
    placeholder: MessagePlaceholder,
  ): string | null {
    const value = this.readFromPath(obj, path);

    if (value === undefined) {
      return null;
    }
    if (Array.isArray(value)) {
      return ArrayFormatter.format(value, placeholder.values.slice(1));
    }

    return String(value);
  }

  protected readFromPath<T>(obj: T, path: string): unknown {
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
