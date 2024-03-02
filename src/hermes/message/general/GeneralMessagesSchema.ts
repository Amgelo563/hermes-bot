import { z } from 'zod';

import { DiscordButtonSchema } from '../../../discord/button/DiscordButtonSchema';
import { DiscordEmbedSchema } from '../../../discord/embed/DiscordEmbedSchema';

export const GeneralMessagesSchema = z.object({
  booleans: z.object({
    yes: z.string(),
    no: z.string(),
  }),

  pagination: z.object({
    previous: DiscordButtonSchema,
    next: DiscordButtonSchema,
  }),

  continue: z.object({
    safe: z.object({
      yes: DiscordButtonSchema,
      no: DiscordButtonSchema,
    }),
    unsafe: z.object({
      yes: DiscordButtonSchema,
      no: DiscordButtonSchema,
    }),
  }),

  confirm: z.object({
    button: DiscordButtonSchema,
    embed: DiscordEmbedSchema,
  }),

  cancel: z.object({
    button: DiscordButtonSchema,
    embed: DiscordEmbedSchema,
  }),

  unknownError: z.object({
    log: DiscordEmbedSchema,
    user: DiscordEmbedSchema,
  }),

  updateButton: DiscordButtonSchema,
  deleteButton: DiscordButtonSchema,
});
