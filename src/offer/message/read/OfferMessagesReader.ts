import type { Identifiable } from '@nyx-discord/core';

import { AbstractMessageFileReader } from '../../../message/file/AbstractMessageFileReader';
import { OfferMessagesSchema } from './OfferMessagesSchema';

export class OfferMessagesReader
  extends AbstractMessageFileReader<typeof OfferMessagesSchema>
  implements Identifiable
{
  public static readonly ID = Symbol('OfferMessages');

  constructor() {
    super('offer', OfferMessagesSchema);
  }

  public getId() {
    return OfferMessagesReader.ID;
  }
}
