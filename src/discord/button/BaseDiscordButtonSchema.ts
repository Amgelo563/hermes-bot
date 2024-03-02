import { z } from 'zod';

export const BaseDiscordButtonSchema = z.object({
  label: z.string(),
  emoji: z.string().optional(),
});
