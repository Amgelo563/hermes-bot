import type { Identifiable } from '@nyx-discord/core';
import { AbstractMessageFileReader } from '../../message/file/AbstractMessageFileReader';
import { TagsMessagesSchema } from './TagsMessagesSchema';

export class TagsMessagesReader
  extends AbstractMessageFileReader<typeof TagsMessagesSchema>
  implements Identifiable
{
  public static readonly ID = Symbol('TagsMessages');

  constructor(language: string) {
    super(language, 'tags', TagsMessagesSchema);
  }

  public getId() {
    return TagsMessagesReader.ID;
  }
}
