import type { EventDispatchMeta } from '@nyx-discord/core';
import { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { Message } from 'discord.js';
import { Events } from 'discord.js';

import type { StickyMessageSendDebouncer } from '../debounce/StickyMessageSendDebouncer';

// eslint-disable-next-line max-len
export class MessageInStickyChannelEventSubscriber extends AbstractDJSClientSubscriber<Events.MessageCreate> {
  protected readonly event = Events.MessageCreate;

  protected readonly debouncer: StickyMessageSendDebouncer;

  protected readonly channelId: string;

  protected readonly deleteOther: boolean;

  constructor(
    debouncer: StickyMessageSendDebouncer,
    channelId: string,
    deleteOther: boolean,
  ) {
    super();
    this.debouncer = debouncer;
    this.channelId = channelId;
    this.deleteOther = deleteOther;
  }

  public async handleEvent(
    meta: EventDispatchMeta,
    message: Message,
  ): Promise<void> {
    if (message.channelId !== this.channelId) return;
    if (this.deleteOther && message.author.id !== message.client.user?.id) {
      await message.delete();
      return;
    }

    this.debouncer.debounce();
    meta.setHandled();
  }
}
