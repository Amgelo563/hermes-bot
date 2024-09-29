import type { MessagePlaceholder } from '../MessagePlaceholder';
import type { MessagePlaceholderManager } from '../MessagePlaceholderManager';
import type { MessagePlaceholderReplacer } from '../replace/MessagePlaceholderReplacer';

export class SlicePlaceholderReplacer<Context extends object>
  implements MessagePlaceholderReplacer<Context>
{
  protected readonly manager: MessagePlaceholderManager<Context>;

  constructor(manager: MessagePlaceholderManager<Context>) {
    this.manager = manager;
  }

  public replace(
    placeholder: MessagePlaceholder,
    context: Context,
  ): string | null {
    const [maxString, namespace, ...values] = placeholder.values;
    if (!maxString || !namespace) return null;

    const max = parseInt(maxString);
    if (isNaN(max) || max <= 1) return null;

    const newPlaceholder: MessagePlaceholder = {
      namespace,
      values,
    };

    const result = this.manager.replacePlaceholder(newPlaceholder, context);
    if (!result) return null;

    return result.length > max ? `${result.slice(0, max - 1)}…` : result;
  }

  public getNamespace(): string {
    return 'slice';
  }
}
