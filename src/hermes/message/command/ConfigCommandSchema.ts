import { z } from 'zod';
import { ConfigCommandOptionSchema } from './ConfigCommandOptionSchema';

export const ConfigCommandSchema = z.object({
  name: z.string().toLowerCase(),
  description: z.string(),
});

export const CommandSchemaWithOptions = <T extends string>(options: T[]) => {
  const shape = {} as Record<T, typeof ConfigCommandOptionSchema>;

  for (const option of options) {
    shape[option] = ConfigCommandOptionSchema;
  }

  return ConfigCommandSchema.extend({
    options: z.object(shape),
  });
};
