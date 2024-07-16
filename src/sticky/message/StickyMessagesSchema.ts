import { z } from 'zod';

import { DiscordEmbedSchema } from '../../discord/embed/DiscordEmbedSchema';

export const StickyMessagesSchema = z.object({
  offer: DiscordEmbedSchema,
  request: DiscordEmbedSchema,
});
