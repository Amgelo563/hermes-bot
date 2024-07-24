import type { NyxLogger } from '@nyx-discord/core';

import { Debouncer } from '../../../debounce/Debouncer';
import type { StickyMessageIdType } from '../../../sticky/identity/StickyMessagesIds';
import type { StickyMessagesDomain } from '../../../sticky/StickyMessagesDomain';

export class StickyMessageSendDebouncer extends Debouncer {
  protected static readonly Delay = 3 * 1000;

  constructor(
    domain: StickyMessagesDomain,
    type: StickyMessageIdType,
    logger: NyxLogger,
  ) {
    super(
      async () => await domain.refreshSticky(type, false),
      StickyMessageSendDebouncer.Delay,
      logger,
    );
  }
}
