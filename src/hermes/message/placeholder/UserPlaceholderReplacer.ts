import { HermesMemberFormatter } from '../../../format/HermesMemberFormatter';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { MessagePlaceholderReplacer } from '../../../message/placeholder/replace/MessagePlaceholderReplacer';
import type { HermesPlaceholderContext } from '../context/HermesPlaceholderContext';

export class UserPlaceholderReplacer
  implements MessagePlaceholderReplacer<HermesPlaceholderContext>
{
  public replace(
    placeholder: MessagePlaceholder,
    context: HermesPlaceholderContext,
  ): string | null {
    const option = placeholder.values[0];

    if (!option || !context.member) {
      return null;
    }

    return HermesMemberFormatter.format(context.member, option);
  }

  public getNamespace(): string {
    return 'user';
  }
}
