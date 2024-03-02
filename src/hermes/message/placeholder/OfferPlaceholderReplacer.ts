import { ArrayFormatter } from '../../../format/ArrayFormatter';
import { DiscordDateFormatter } from '../../../format/DiscordDateFormatter';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { MessagePlaceholderManager } from '../../../message/placeholder/MessagePlaceholderManager';
import type { HermesPlaceholderContext } from '../context/HermesPlaceholderContext';
import type { HermesPlaceholderReplacer } from './abstract/HermesPlaceholderReplacer';

export class OfferPlaceholderReplacer implements HermesPlaceholderReplacer {
  protected readonly manager: MessagePlaceholderManager<HermesPlaceholderContext>;

  constructor(manager: MessagePlaceholderManager<HermesPlaceholderContext>) {
    this.manager = manager;
  }

  public replace(
    placeholder: MessagePlaceholder,
    context: HermesPlaceholderContext,
  ): string | null {
    const arg = placeholder.values[0];
    const offer = context.services?.offer;

    if (!offer || !arg) return null;

    switch (arg.toLowerCase()) {
      case 'id':
        return String(offer.id);
      case 'title':
        return offer.title;
      case 'description':
        return offer.description;
      case 'price':
        return offer.price;
      case 'thumbnail':
        return offer.thumbnail;
      case 'image':
        return offer.image;
      case 'userid':
        return offer.userId;
      case 'channelid':
        return offer.channelId;
      case 'messageid':
        return offer.messageId;
      case 'createdat':
        return DiscordDateFormatter.format(
          offer.createdAt,
          placeholder.values[1],
        );
      case 'lastpostedat':
        return DiscordDateFormatter.format(
          offer.lastPostedAt,
          placeholder.values[1],
        );
      case 'tags': {
        const arrayArg = placeholder.values.slice(1);
        if (!arrayArg || !arrayArg.length) return null;

        return ArrayFormatter.format(offer.tags, arrayArg);
      }
      case 'user': {
        const newPlaceholder: MessagePlaceholder = {
          namespace: 'user',
          values: placeholder.values.slice(1),
        };

        return this.manager.replacePlaceholder(newPlaceholder, context);
      }
      case 'url':
        return `https://discord.com/channels/${offer.guildId}/${offer.channelId}/${offer.messageId}`;
      default:
        return null;
    }
  }

  public getNamespace(): string {
    return 'offer';
  }
}
