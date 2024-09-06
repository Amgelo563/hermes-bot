import type { NyxBot } from '@nyx-discord/core';

import type { HermesConfig } from '../../config/file/HermesConfigSchema';
import type { StickyMessageIdType } from '../../sticky/identity/StickyMessagesIds';
import { StickyMessageIdEnum } from '../../sticky/identity/StickyMessagesIds';
import type { StickyMessagesDomain } from '../../sticky/StickyMessagesDomain';
import { StickyMessageSendDebouncer } from './debounce/StickyMessageSendDebouncer';
import { MessageInStickyChannelEventSubscriber } from './events/MessageInStickyChannelEventSubscriber';

export class BotStickyMessagesManager {
  protected readonly domain: StickyMessagesDomain;

  protected readonly debouncers: Record<
    StickyMessageIdType,
    StickyMessageSendDebouncer
  >;

  protected readonly config: HermesConfig;

  protected readonly bot: NyxBot;

  constructor(
    domain: StickyMessagesDomain,
    debouncers: Record<StickyMessageIdType, StickyMessageSendDebouncer>,
    config: HermesConfig,
    bot: NyxBot,
  ) {
    this.domain = domain;
    this.debouncers = debouncers;
    this.config = config;
    this.bot = bot;
  }

  public static create(
    bot: NyxBot,
    config: HermesConfig,
    domain: StickyMessagesDomain,
  ): BotStickyMessagesManager {
    const logger = bot.getLogger();

    const debouncers = {
      [StickyMessageIdEnum.Offer]: new StickyMessageSendDebouncer(
        domain,
        StickyMessageIdEnum.Offer,
        logger,
      ),

      [StickyMessageIdEnum.Request]: new StickyMessageSendDebouncer(
        domain,
        StickyMessageIdEnum.Request,
        logger,
      ),
    };

    return new BotStickyMessagesManager(domain, debouncers, config, bot);
  }

  public async start(): Promise<void> {
    const subscribers = Object.values(StickyMessageIdEnum)
      .filter((type) => this.config[type].stickyMessage.send)
      .map((type) => {
        const channelId = this.config[type].channel;
        const deleteOther = this.config[type].stickyMessage.deleteOther;

        return new MessageInStickyChannelEventSubscriber(
          this.debouncers[type],
          channelId,
          deleteOther,
        );
      });

    await this.bot.getEventManager().subscribeClient(...subscribers);
  }
}
