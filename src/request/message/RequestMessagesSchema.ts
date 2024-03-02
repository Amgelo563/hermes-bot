import { z } from 'zod';
import { DiscordButtonSchema } from '../../discord/button/DiscordButtonSchema';
import { DiscordLinkButtonSchema } from '../../discord/button/DiscordLinkButtonSchema';

import { DiscordEmbedSchema } from '../../discord/embed/DiscordEmbedSchema';
import { DiscordTemplatedEmbedSchema } from '../../discord/embed/DiscordTemplatedEmbedSchema';
import { ModalSchemaWithFields } from '../../discord/modal/schema/DiscordModalSchema';
import { DiscordSelectMenuSchema } from '../../discord/select/DiscordSelectMenuSchema';
import {
  CommandSchemaWithOptions,
  ConfigCommandSchema,
} from '../../hermes/message/command/ConfigCommandSchema';

export const RequestMessagesSchema = z.object({
  notFoundError: DiscordEmbedSchema,
  empty: z.string(),
  parentCommand: ConfigCommandSchema,

  info: z.object({
    command: CommandSchemaWithOptions(['request']),
    linkButton: DiscordLinkButtonSchema,
  }),

  create: z.object({
    command: ConfigCommandSchema,
    modal: ModalSchemaWithFields(['title', 'description', 'budget']),
    tagSelect: DiscordSelectMenuSchema,

    previewing: DiscordEmbedSchema,
    success: DiscordEmbedSchema,
    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),

    requirements: z.object({
      deny: DiscordTemplatedEmbedSchema,
      warn: DiscordTemplatedEmbedSchema,
    }),
  }),

  repost: z.object({
    requirements: z.object({
      deny: DiscordTemplatedEmbedSchema,
      warn: DiscordTemplatedEmbedSchema,
    }),

    command: CommandSchemaWithOptions(['request']),
    button: DiscordButtonSchema,

    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),
    success: DiscordEmbedSchema,
  }),

  update: z.object({
    command: CommandSchemaWithOptions(['request']),

    success: DiscordEmbedSchema,
    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),

    requirements: z.object({
      deny: DiscordTemplatedEmbedSchema,
      warn: DiscordTemplatedEmbedSchema,
    }),

    previewing: DiscordEmbedSchema,
    log: DiscordEmbedSchema,
  }),

  post: DiscordEmbedSchema,

  delete: z.object({
    command: CommandSchemaWithOptions(['request']),
    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),
    success: DiscordEmbedSchema,

    confirm: DiscordEmbedSchema,
    log: DiscordEmbedSchema,
  }),
});
