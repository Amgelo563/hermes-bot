import { z } from 'zod';
import { ZodFalseSchema } from '../../zod/ZodFalseSchema';

export const BlacklistConfigSchema = z.object({
  log: z.union([
    z.object({
      channel: z.string(),
      create: z.boolean(),
      delete: z.boolean(),
    }),
    ZodFalseSchema,
  ]),
});

export type BlacklistConfig = z.infer<typeof BlacklistConfigSchema>;
