import { join as joinPath } from 'path';
import type { z } from 'zod';

import { testFileRead } from '../../helpers/testFileRead';
import { getMessagesLanguages } from './getMessagesLanguages';

const languages = getMessagesLanguages();

export function testMessageFile(file: string, schema: z.ZodTypeAny) {
  for (const language of languages) {
    const path = joinPath('lang', language, `${file}.conf`);
    testFileRead(`${file} messages (${language})`, path, schema);
  }
}
