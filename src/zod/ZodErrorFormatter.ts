import type { ZodError } from 'zod';

export class ZodErrorFormatter {
  public static format(error: ZodError) {
    return error.flatten((issue) => {
      return {
        ...issue,
        message: issue.message,
        path: issue.path.join('.'),
        code: issue.code,
      };
    });
  }
}
