import { z } from 'zod';

export const ConfigCommandOptionSchema = z.object({
  name: z.string().toLowerCase(),
  description: z.string(),
});

export type ConfigCommandOption = z.infer<typeof ConfigCommandOptionSchema>;
