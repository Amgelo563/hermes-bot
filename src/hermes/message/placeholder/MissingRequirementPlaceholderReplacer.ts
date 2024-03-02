import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { HermesPlaceholderContext } from '../context/HermesPlaceholderContext';
import type { HermesPlaceholderReplacer } from './abstract/HermesPlaceholderReplacer';

export class MissingRequirementPlaceholderReplacer
  implements HermesPlaceholderReplacer
{
  public replace(
    placeholder: MessagePlaceholder,
    context: HermesPlaceholderContext,
  ): string | null {
    const [arg] = placeholder.values;
    if (!arg || !context.missingRequirement) return null;

    switch (arg) {
      case 'name':
        return context.missingRequirement.name;
      case 'description':
        return context.missingRequirement.description;
      default:
        return null;
    }
  }

  public getNamespace(): string {
    return 'missingRequirement';
  }
}
