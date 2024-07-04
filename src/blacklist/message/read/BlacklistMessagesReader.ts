import type { Identifiable } from '@nyx-discord/core';

import { AbstractMessageFileReader } from '../../../message/file/AbstractMessageFileReader';
import { BlacklistMessagesSchema } from './BlacklistMessagesSchema';

export class BlacklistMessagesReader
  extends AbstractMessageFileReader<typeof BlacklistMessagesSchema>
  implements Identifiable
{
  public static readonly ID = Symbol('BlacklistMessages');

  constructor(language: string) {
    super(language, 'blacklist', BlacklistMessagesSchema);
  }

  public getId() {
    return BlacklistMessagesReader.ID;
  }
}
