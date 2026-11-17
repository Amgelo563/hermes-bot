import { z } from 'zod';

import { EscapeMarkdownConfigSchema } from '../escape/EscapeMarkdownConfigSchema';

export const GeneralConfigSchema = z.object({
  saveLogs: z.boolean(),
  escapeMarkdown: EscapeMarkdownConfigSchema,
  debug: z.boolean(),
});

export type GeneralConfig = z.infer<typeof GeneralConfigSchema>;
