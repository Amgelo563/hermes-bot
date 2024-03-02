import { DiscordDateFormatter } from '../../../format/DiscordDateFormatter';
import type { MessagePlaceholder } from '../../../message/placeholder/MessagePlaceholder';
import type { MessagePlaceholderManager } from '../../../message/placeholder/MessagePlaceholderManager';
import type { HermesPlaceholderContext } from '../context/HermesPlaceholderContext';
import type { HermesPlaceholderReplacer } from './abstract/HermesPlaceholderReplacer';

export class RequestPlaceholderReplacer implements HermesPlaceholderReplacer {
  protected readonly manager: MessagePlaceholderManager<HermesPlaceholderContext>;

  constructor(manager: MessagePlaceholderManager<HermesPlaceholderContext>) {
    this.manager = manager;
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
        return request.userId;
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
        const newContext: HermesPlaceholderContext = {
          ...context,
          services: {
            ...context.services,
            tag: request.tag,
          },
        };

        return this.manager.replacePlaceholder(newPlaceholder, newContext);
      }
      case 'user': {
        const newPlaceholder: MessagePlaceholder = {
          namespace: 'user',
          values: placeholder.values.slice(1),
        };

        return this.manager.replacePlaceholder(newPlaceholder, context);
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
