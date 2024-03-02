import { z } from 'zod';

export const DiscordModalFieldSchema = z.object({
  placeholder: z.string().optional(),
  value: z.string().optional(),
  label: z.string(),
});
