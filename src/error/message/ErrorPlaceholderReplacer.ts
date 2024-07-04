import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesPlaceholderReplacer } from '../../hermes/message/placeholder/HermesPlaceholderReplacer';
import type { MessagePlaceholder } from '../../message/placeholder/MessagePlaceholder';

export class ErrorPlaceholderReplacer implements HermesPlaceholderReplacer {
  public replace(
    placeholder: MessagePlaceholder,
    context: HermesPlaceholderContext,
  ): string | null {
    const [arg] = placeholder.values;
    if (!arg || !context.error) return null;

    switch (arg) {
      case 'name':
        return context.error.instance.name;
      case 'message':
        return context.error.instance.message;
      case 'stack':
        return context.error.instance.stack ?? 'No stack.';
      case 'id':
        return context.error.id;
      default:
        return null;
    }
  }

  public getNamespace(): string {
    return 'error';
  }
}
