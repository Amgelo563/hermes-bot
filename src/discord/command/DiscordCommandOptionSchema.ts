import { z } from 'zod';

export const DiscordCommandOptionSchema = z.object({
  name: z.string().toLowerCase(),
  description: z.string(),
});

export type ConfigCommandOption = z.infer<typeof DiscordCommandOptionSchema>;
