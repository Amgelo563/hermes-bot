import { z } from 'zod';
import { DiscordModalFieldSchema } from './DiscordModalFieldSchema';

export const DiscordModalSchema = z.object({
  title: z.string(),
});

export const ModalSchemaWithFields = <T extends string>(fields: T[]) => {
  const shape = {} as Record<T, typeof DiscordModalFieldSchema>;

  for (const field of fields) {
    shape[field] = DiscordModalFieldSchema;
  }

  return DiscordModalSchema.extend({
    fields: z.object(shape),
  });
};
