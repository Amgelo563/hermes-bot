import { z } from 'zod';

import {
  CommandSchemaWithOptions,
  DiscordCommandSchema,
} from '../../../discord/command/DiscordCommandSchema';
import { DiscordEmbedSchema } from '../../../discord/embed/DiscordEmbedSchema';
import { DiscordTemplatedEmbedSchema } from '../../../discord/embed/DiscordTemplatedEmbedSchema';
import { ModalSchemaWithFields } from '../../../discord/modal/schema/DiscordModalSchema';

export const BlacklistMessagesSchema = z.object({
  notAllowed: DiscordEmbedSchema,

  command: DiscordCommandSchema,
  permanent: z.string(),

  notBlacklisted: DiscordEmbedSchema,
  alreadyBlacklisted: DiscordEmbedSchema,

  info: z.object({
    command: CommandSchemaWithOptions(['user']),
    embed: DiscordEmbedSchema,
  }),

  create: z.object({
    command: CommandSchemaWithOptions(['user']),

    modal: ModalSchemaWithFields(['time', 'reason']),
    confirm: DiscordEmbedSchema,
    success: DiscordEmbedSchema,
    log: DiscordEmbedSchema,

    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),
  }),

  list: z.object({
    command: DiscordCommandSchema,
    embed: DiscordTemplatedEmbedSchema,

    empty: z.string(),
  }),

  delete: z.object({
    command: CommandSchemaWithOptions(['user']),
    success: DiscordEmbedSchema,
    log: DiscordEmbedSchema,

    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),
  }),

  expire: z.object({
    log: DiscordEmbedSchema,
    error: DiscordEmbedSchema,
  }),

  requirementDeny: DiscordEmbedSchema,
});
