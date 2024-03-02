import { z } from 'zod';

import { ZodFalseSchema } from '../../zod/ZodFalseSchema';
import { ConfigTagSchema } from './ConfigTagSchema';

export const TagConfigSchema = z.object({
  defaultTags: ConfigTagSchema.array(),
  log: z.union([
    z.object({
      channel: z.string(),

      create: z.boolean(),
      update: z.boolean(),
      delete: z.boolean(),
    }),
    ZodFalseSchema,
  ]),
});

export type TagConfig = z.infer<typeof TagConfigSchema>;
