import parse from '@pushcorn/hocon-parser';
import { statSync } from 'fs';
import { existsSync } from 'node:fs';
import type { z } from 'zod';

export class FileReader<S extends z.ZodTypeAny> {
  public static readonly Extension = '.conf';

  protected readonly file: string;

  protected readonly schema: S;

  protected cached: z.infer<S> | undefined;

  constructor(file: string, schema: S) {
    this.file = file.endsWith(FileReader.Extension)
      ? file
      : `${file}${FileReader.Extension}`;

    this.schema = schema;
  }

  public async read(): Promise<z.infer<S>> {
    if (this.cached) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.cached;
    }

    if (!existsSync(this.file)) {
      throw new Error(`File '${this.file}' not found`);
    }

    const stat = statSync(this.file);

    if (!stat || !stat.isFile()) {
      throw new Error(`File '${this.file}' not found or is not a file`);
    }

    const read = await parse({
      url: this.file,
      strict: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = this.schema.parse(read);

    this.cached = parsed as z.infer<S>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return parsed;
  }

  public getCached(): z.infer<S> | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.cached;
  }
}
