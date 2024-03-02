import { z } from 'zod';

import { RequirementConfigSchema } from '../../hermes/requirement/config/RequirementConfigSchema';
import { ZodFalseSchema } from '../../zod/ZodFalseSchema';

export const OfferConfigSchema = z.object({
  requirements: z.object({
    publish: RequirementConfigSchema.array(),
    repost: RequirementConfigSchema.array(),
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

export type OfferConfig = z.infer<typeof OfferConfigSchema>;
