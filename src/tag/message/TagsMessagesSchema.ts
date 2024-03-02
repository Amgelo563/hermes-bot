import { z } from 'zod';

import { DiscordEmbedSchema } from '../../discord/embed/DiscordEmbedSchema';
import { DiscordTemplatedEmbedSchema } from '../../discord/embed/DiscordTemplatedEmbedSchema';
import { ModalSchemaWithFields } from '../../discord/modal/schema/DiscordModalSchema';
import { DiscordSelectMenuSchema } from '../../discord/select/DiscordSelectMenuSchema';
import {
  CommandSchemaWithOptions,
  ConfigCommandSchema,
} from '../../hermes/message/command/ConfigCommandSchema';
import { ConfigTagSchema } from '../config/ConfigTagSchema';

export const TagsMessagesSchema = z.object({
  notFound: DiscordEmbedSchema,

  command: ConfigCommandSchema,
  noTags: ConfigTagSchema,
  notAllowed: DiscordEmbedSchema,

  list: z.object({
    command: ConfigCommandSchema,

    empty: z.string(),

    embed: DiscordTemplatedEmbedSchema,
    select: DiscordSelectMenuSchema,
  }),

  create: z.object({
    command: ConfigCommandSchema,

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
