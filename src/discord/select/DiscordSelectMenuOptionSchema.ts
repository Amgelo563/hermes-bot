import { z } from 'zod';

export const DiscordSelectMenuOptionSchema = z.object({
  description: z.string().optional(),
  emoji: z
    .union([
      // Unicode emoji
      z.string().emoji().length(2),
      // Custom emoji
      z.string().regex(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/),
    ])
    .optional(),
  label: z.string(),
});

export type SelectMenuOptionSchemaType = z.infer<
  typeof DiscordSelectMenuOptionSchema
>;
