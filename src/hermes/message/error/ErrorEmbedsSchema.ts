import { z } from 'zod';
import { DiscordEmbedSchema } from '../../../discord/embed/DiscordEmbedSchema';

export const ErrorEmbedsSchema = z.object({
  log: DiscordEmbedSchema,
  user: DiscordEmbedSchema,
});
