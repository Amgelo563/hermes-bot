import { BaseDiscordEmbedSchema } from './BaseDiscordEmbedSchema';
import { DiscordEmbedFieldSchema } from './DiscordEmbedFieldSchema';
import { DiscordEmbedLimits } from './DiscordEmbedLimits';

export const DiscordEmbedSchema = BaseDiscordEmbedSchema.extend({
  fields: DiscordEmbedFieldSchema.array()
    .max(DiscordEmbedLimits.Fields)
    .optional(),
});
