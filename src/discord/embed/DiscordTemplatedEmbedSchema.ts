import { z } from 'zod';

import { BaseDiscordEmbedSchema } from './BaseDiscordEmbedSchema';
import { DiscordEmbedFieldSchema } from './DiscordEmbedFieldSchema';

export const DiscordTemplatedEmbedSchema = BaseDiscordEmbedSchema.and(
  z.object({
    fieldsTemplate: DiscordEmbedFieldSchema,
    fields: z.undefined().optional(),
  }),
);
