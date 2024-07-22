import { z } from 'zod';

import { DiscordSelectMenuOptionSchema } from './DiscordSelectMenuOptionSchema';

export const DiscordSelectMenuSchema = z.object({
  placeholder: z.string(),
});

export const SelectMenuSchemaWithOptions = <T extends string>(options: T[]) => {
  const shape = {} as Record<T, typeof DiscordSelectMenuOptionSchema>;

  for (const option of options) {
    shape[option] = DiscordSelectMenuOptionSchema;
  }

  return DiscordSelectMenuSchema.extend({
    options: z.object(shape),
  });
};

export type SelectMenuSchemaType<
  Options extends string | undefined = undefined,
> = z.infer<
  Options extends string
    ? ReturnType<typeof SelectMenuSchemaWithOptions<Options>>
    : typeof DiscordSelectMenuSchema
>;
