import { z } from 'zod';

export const DiscordSelectMenuSchema = z.object({
  placeholder: z.string(),
});
