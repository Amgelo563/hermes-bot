import { DiscordDateFormatter } from '../../../format/DiscordDateFormatter';
import { HermesMemberFormatter } from '../../../format/HermesMemberFormatter';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { HermesPlaceholderReplacer } from '../../../hermes/message/placeholder/HermesPlaceholderReplacer';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';

export class BlacklistPlaceholderReplacer implements HermesPlaceholderReplacer {
  protected readonly permanentString: string;

  constructor(permanentString: string) {
    this.permanentString = permanentString;
  }

  public replace(
    placeholder: MessagePlaceholder,
    context: HermesPlaceholderContext,
  ): string | null {
    const arg = placeholder.values[0];
    const blacklist = context.blacklist;

    if (!blacklist || !arg) return null;

    switch (arg.toLowerCase()) {
      case 'id':
        return blacklist.id;
      case 'createdat':
        return DiscordDateFormatter.format(
          blacklist.createdAt,
          placeholder.values[1],
        );
      case 'expiresat':
        return blacklist.expiresAt
          ? DiscordDateFormatter.format(
              blacklist.expiresAt,
              placeholder.values[1],
            )
          : this.permanentString;
      case 'blacklister':
        return HermesMemberFormatter.format(
          blacklist.blacklister,
          placeholder.values[1],
        );
      case 'blacklisted':
        return HermesMemberFormatter.format(
          blacklist.blacklisted,
          placeholder.values[1],
        );
      case 'reason':
        return blacklist.reason;
      default:
        return null;
    }
  }

  public getNamespace(): string {
    return 'blacklist';
  }
}
