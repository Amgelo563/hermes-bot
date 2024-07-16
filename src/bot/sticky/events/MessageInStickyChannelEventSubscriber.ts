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

  constructor(debouncer: StickyMessageSendDebouncer, channelId: string) {
    super();
    this.debouncer = debouncer;
    this.channelId = channelId;
  }

  public handleEvent(meta: EventDispatchMeta, message: Message): void {
    if (message.author.id === message.client.user.id) return;
    if (message.channelId !== this.channelId) return;

    this.debouncer.debounce();
    meta.setHandled();
  }
}
