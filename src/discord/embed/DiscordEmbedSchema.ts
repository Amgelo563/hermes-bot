import { z } from 'zod';

import { BaseDiscordEmbedSchema } from './BaseDiscordEmbedSchema';
import { DiscordEmbedFieldSchema } from './DiscordEmbedFieldSchema';
import { DiscordEmbedLimits } from './DiscordEmbedLimits';

export const DiscordEmbedSchema = BaseDiscordEmbedSchema.and(
  z.object({
    fields: DiscordEmbedFieldSchema.array()
      .max(DiscordEmbedLimits.Fields)
      .optional(),
  }),
);
