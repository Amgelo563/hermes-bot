import { z } from 'zod';

export const DiscordConfigSchema = z.object({
  token: z.string(),
  server: z.string(),
  staffRoles: z.string().array(),
  errorLogChannel: z.string(),
});

export type DiscordConfig = z.infer<typeof DiscordConfigSchema>;
