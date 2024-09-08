import { DiscordDateFormatter } from '../../../format/DiscordDateFormatter';
import { HermesMemberFormatter } from '../../../format/HermesMemberFormatter';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { HermesPlaceholderReplacer } from '../../../hermes/message/placeholder/HermesPlaceholderReplacer';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { MessagePlaceholderManager } from '../../../message/placeholder/MessagePlaceholderManager';
import type { TagData } from '../../../tag/data/TagData';

export class RequestPlaceholderReplacer implements HermesPlaceholderReplacer {
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
    const request = context.services?.request;

    if (!request || !arg) return null;

    switch (arg.toLowerCase()) {
      case 'id':
        return String(request.id);
      case 'title':
        return request.title;
      case 'description':
        return request.description;
      case 'budget':
        return request.budget;
      case 'userid':
        return request.memberId;
      case 'channelid':
        return request.channelId;
      case 'messageid':
        return request.messageId;
      case 'createdat':
        return DiscordDateFormatter.format(
          request.createdAt,
          placeholder.values[1],
        );
      case 'lastpostedat':
        return DiscordDateFormatter.format(
          request.lastPostedAt,
          placeholder.values[1],
        );
      case 'tag': {
        const newPlaceholder: MessagePlaceholder = {
          namespace: 'tag',
          values: placeholder.values.slice(1),
        };
        const requestCopy = { ...request };
        requestCopy.tag ??= this.noTagsTag;

        const newContext: HermesPlaceholderContext = {
          ...context,
          services: {
            ...context.services,
            request: requestCopy,
            tag: request.tag ?? this.noTagsTag,
          },
        };

        return this.manager.replacePlaceholder(newPlaceholder, newContext);
      }
      case 'user': {
        return HermesMemberFormatter.format(
          request.member,
          placeholder.values[1],
        );
      }
      case 'url':
        return `https://discord.com/channels/${request.guildId}/${request.channelId}/${request.messageId}`;
      default:
        return null;
    }
  }

  public getNamespace(): string {
    return 'request';
  }
}
