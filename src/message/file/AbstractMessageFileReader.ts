import type { Identifier } from '@nyx-discord/core';
import { join as joinPath } from 'path';
import type { z } from 'zod';
import { FileReader } from '../../file/FileReader';
import type { MessageSource } from '../source/MessageSource';

export abstract class AbstractMessageFileReader<S extends z.ZodTypeAny>
  extends FileReader<S>
  implements MessageSource<S>
{
  constructor(file: string, schema: S) {
    const newFile = joinPath('messages', file);
    super(newFile, schema);
  }

  public getFilename(): string {
    return this.file;
  }

  public abstract getId(): Identifier;
}
