import { z } from 'zod';
import { RequirementConfigSchema } from '../../hermes/requirement/config/RequirementConfigSchema';

import { ZodFalseSchema } from '../../zod/ZodFalseSchema';

export const RequestConfigSchema = z.object({
  requirements: z.object({
    repost: RequirementConfigSchema.array(),
    publish: RequirementConfigSchema.array(),
    update: RequirementConfigSchema.array(),
  }),
  channel: z.string(),
  log: z.union([
    z.object({
      channel: z.string(),
      update: z.boolean(),
      delete: z.boolean(),
    }),
    ZodFalseSchema,
  ]),
});

export type RequestConfig = z.infer<typeof RequestConfigSchema>;
