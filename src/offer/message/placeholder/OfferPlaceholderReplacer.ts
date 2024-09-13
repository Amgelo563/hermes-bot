import { ArrayFormatter } from '../../../format/ArrayFormatter';
import { DiscordDateFormatter } from '../../../format/DiscordDateFormatter';
import { HermesMemberFormatter } from '../../../format/HermesMemberFormatter';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { HermesPlaceholderReplacer } from '../../../hermes/message/placeholder/HermesPlaceholderReplacer';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { MessagePlaceholderManager } from '../../../message/placeholder/MessagePlaceholderManager';
import type { TagData } from '../../../tag/data/TagData';

export class OfferPlaceholderReplacer implements HermesPlaceholderReplacer {
  protected readonly manager: MessagePlaceholderManager<HermesPlaceholderContext>;

  protected readonly noTagsTag: TagData;

  constructor(
    manager: MessagePlaceholderManager<HermesPlaceholderContext>,
    noTagsTag: TagData,
  ) {
    this.manager = manager;
    this.noTagsTag = noTagsTag;
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
      case 'shortdescription':
        return offer.description.length > 100
          ? offer.description.slice(0, 100) + '…'
          : offer.description;
      case 'price':
        return offer.price;
      case 'thumbnail':
        return offer.thumbnail;
      case 'image':
        return offer.image;
      case 'userid':
        return offer.memberId;
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

        const tags = offer.tags.length > 0 ? offer.tags : [this.noTagsTag];
        return ArrayFormatter.format(tags, arrayArg);
      }
      case 'user': {
        return HermesMemberFormatter.format(
          offer.member,
          placeholder.values[1],
        );
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
