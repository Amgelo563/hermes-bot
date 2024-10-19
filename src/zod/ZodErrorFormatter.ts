import type { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

export class ZodErrorFormatter {
  public static format(error: ZodError) {
    const formatted = fromError(error);
    const details = formatted.details
      .map(
        (issue) =>
          `- ${issue.code}: ${issue.message} (${issue.path.join('.')}) ${issue.fatal ? '[FATAL]' : ''}`,
      )
      .join('\n');

    return `${formatted.toString()}. Exact issues:\n${details}`;
  }
}
