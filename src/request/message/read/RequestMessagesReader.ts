import type { Identifiable } from '@nyx-discord/core';
import { AbstractMessageFileReader } from '../../../message/file/AbstractMessageFileReader';
import { RequestMessagesSchema } from './RequestMessagesSchema';

export class RequestMessagesReader
  extends AbstractMessageFileReader<typeof RequestMessagesSchema>
  implements Identifiable
{
  public static readonly ID = Symbol('RequestMessages');

  constructor(language: string) {
    super(language, 'request', RequestMessagesSchema);
  }

  public getId() {
    return RequestMessagesReader.ID;
  }
}
