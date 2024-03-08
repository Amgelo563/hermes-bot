import { z } from 'zod';
import { DiscordCommandOptionSchema } from './DiscordCommandOptionSchema';

export const DiscordCommandSchema = z.object({
  name: z.string().toLowerCase(),
  description: z.string(),
});

export const CommandSchemaWithOptions = <T extends string>(options: T[]) => {
  const shape = {} as Record<T, typeof DiscordCommandOptionSchema>;

  for (const option of options) {
    shape[option] = DiscordCommandOptionSchema;
  }

  return DiscordCommandSchema.extend({
    options: z.object(shape),
  });
};
