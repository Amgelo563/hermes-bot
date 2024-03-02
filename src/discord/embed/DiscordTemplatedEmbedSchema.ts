import { z } from 'zod';
import { BaseDiscordEmbedSchema } from './BaseDiscordEmbedSchema';
import { DiscordEmbedFieldSchema } from './DiscordEmbedFieldSchema';

export const DiscordTemplatedEmbedSchema = BaseDiscordEmbedSchema.extend({
  fieldsTemplate: DiscordEmbedFieldSchema,
  fields: z.undefined().optional(),
});
