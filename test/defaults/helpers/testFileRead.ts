import { statSync } from 'fs';
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { FileReader } from '../../../src/file/FileReader';

export function testFileRead(
  file: string,
  path: string,
  schema: z.ZodTypeAny,
): boolean {
  describe(`${file} - "${path}"`, () => {
    it('should exist', () => {
      const exists = existsSync(path);
      expect(exists).toBeTruthy();
    });

    it('should be a file', () => {
      const stat = statSync(path);
      expect(stat.isFile()).toBeTruthy();
    });

    it('should match the schema and conf format', async () => {
      const reader = new FileReader(path, schema);
      try {
        await reader.read();
      } catch (error) {
        expect(error).toBeUndefined();
      }
    });
  });

  return true;
}
