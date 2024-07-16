import type { Identifiable } from '@nyx-discord/core';

import { AbstractMessageFileReader } from '../../message/file/AbstractMessageFileReader';
import { StickyMessagesSchema } from './StickyMessagesSchema';

export class StickyMessagesReader
  extends AbstractMessageFileReader<typeof StickyMessagesSchema>
  implements Identifiable
{
  public static readonly ID = Symbol('StickyMessages');

  constructor(language: string) {
    super(language, 'sticky-messages', StickyMessagesSchema);
  }

  public getId() {
    return StickyMessagesReader.ID;
  }
}
