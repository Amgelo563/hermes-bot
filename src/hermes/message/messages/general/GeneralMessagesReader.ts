import type { Identifiable } from '@nyx-discord/core';
import { AbstractMessageFileReader } from '../../../../message/file/AbstractMessageFileReader';
import { GeneralMessagesSchema } from './GeneralMessagesSchema';

export class GeneralMessagesReader
  extends AbstractMessageFileReader<typeof GeneralMessagesSchema>
  implements Identifiable
{
  public static readonly ID = Symbol('GeneralMessages');

  constructor(language: string) {
    super(language, 'general', GeneralMessagesSchema);
  }

  public getId() {
    return GeneralMessagesReader.ID;
  }
}
