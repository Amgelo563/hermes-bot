import { z } from 'zod';

import { DiscordButtonSchema } from '../../../discord/button/DiscordButtonSchema';
import { DiscordLinkButtonSchema } from '../../../discord/button/DiscordLinkButtonSchema';
import {
  CommandSchemaWithOptions,
  DiscordCommandSchema,
} from '../../../discord/command/DiscordCommandSchema';
import { DiscordEmbedLimits } from '../../../discord/embed/DiscordEmbedLimits';
import { DiscordEmbedSchema } from '../../../discord/embed/DiscordEmbedSchema';
import { DiscordTemplatedEmbedSchema } from '../../../discord/embed/DiscordTemplatedEmbedSchema';
import { ModalSchemaWithFields } from '../../../discord/modal/schema/DiscordModalSchema';
import { SelectMenuSchemaWithOptions } from '../../../discord/select/DiscordSelectMenuSchema';

export const OfferMessagesSchema = z.object({
  notFoundError: DiscordEmbedSchema,
  empty: z.string(),
  parentCommand: DiscordCommandSchema,

  stickyMessage: DiscordEmbedSchema.or(
    DiscordEmbedSchema.array().min(1).max(DiscordEmbedLimits.Message),
  ),

  info: z.object({
    command: CommandSchemaWithOptions(['offer']),
    linkButton: DiscordLinkButtonSchema,
  }),

  create: z.object({
    command: DiscordCommandSchema,
    modal: ModalSchemaWithFields([
      'title',
      'description',
      'price',
      'image',
      'thumbnail',
    ]),
    tagSelect: SelectMenuSchemaWithOptions(['tag']),

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

    command: CommandSchemaWithOptions(['offer']),
    button: DiscordButtonSchema,

    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),
    success: DiscordEmbedSchema,
  }),

  update: z.object({
    command: CommandSchemaWithOptions(['offer']),

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
    command: CommandSchemaWithOptions(['offer']),

    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),
    success: DiscordEmbedSchema,

    confirm: DiscordEmbedSchema,
    log: DiscordEmbedSchema,
  }),

  search: z.object({
    command: DiscordCommandSchema,
    error: z.object({
      user: DiscordEmbedSchema,
      log: DiscordEmbedSchema,
    }),
    embed: DiscordTemplatedEmbedSchema,
    noResults: z.string(),
  }),
});

export type OfferMessages = z.infer<typeof OfferMessagesSchema>;
