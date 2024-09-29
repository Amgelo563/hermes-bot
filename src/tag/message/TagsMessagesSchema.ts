import { z } from 'zod';

import {
  CommandSchemaWithOptions,
  DiscordCommandSchema,
} from '../../discord/command/DiscordCommandSchema';
import { DiscordEmbedSchema } from '../../discord/embed/DiscordEmbedSchema';
import { DiscordTemplatedEmbedSchema } from '../../discord/embed/DiscordTemplatedEmbedSchema';
import { ModalSchemaWithFields } from '../../discord/modal/schema/DiscordModalSchema';
import { SelectMenuSchemaWithOptions } from '../../discord/select/DiscordSelectMenuSchema';
import { ConfigTagSchema } from '../config/ConfigTagSchema';

export const TagsMessagesSchema = z.object({
  notFound: DiscordEmbedSchema,

  command: DiscordCommandSchema,
  noTags: ConfigTagSchema,
  notAllowed: DiscordEmbedSchema,

  list: z.object({
    command: DiscordCommandSchema,

    empty: z.string(),

    embed: DiscordTemplatedEmbedSchema,
    select: SelectMenuSchemaWithOptions(['tag']),
  }),

  create: z.object({
    command: DiscordCommandSchema,

    success: DiscordEmbedSchema,
    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),

    modal: ModalSchemaWithFields(['name', 'description', 'color']),

    log: DiscordEmbedSchema,
  }),

  info: z.object({
    command: CommandSchemaWithOptions(['tag']),
    embed: DiscordEmbedSchema,
  }),

  delete: z.object({
    command: CommandSchemaWithOptions(['tag']),
    success: DiscordEmbedSchema,

    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),

    protectedError: DiscordEmbedSchema,
    confirm: DiscordEmbedSchema,
    log: DiscordEmbedSchema,
  }),

  update: z.object({
    command: CommandSchemaWithOptions(['tag']),
    success: DiscordEmbedSchema,
    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),

    log: DiscordEmbedSchema,
  }),
});
