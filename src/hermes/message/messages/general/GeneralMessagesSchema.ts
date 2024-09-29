import { z } from 'zod';

import type { DateFilterStateKey } from '../../../../bot/search/sessions/filter/filters/ServiceSearchDateFilter';
import { ServiceSearchDateFilter } from '../../../../bot/search/sessions/filter/filters/ServiceSearchDateFilter';
import { DiscordButtonSchema } from '../../../../discord/button/DiscordButtonSchema';
import { DiscordEmbedSchema } from '../../../../discord/embed/DiscordEmbedSchema';
import { SelectMenuSchemaWithOptions } from '../../../../discord/select/DiscordSelectMenuSchema';

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

  unknownMember: z.object({
    username: z.string().max(45),
    discriminator: z.string().max(4),
    avatar: z.string().url(),
  }),

  notInGuildError: DiscordEmbedSchema,

  filters: z.object({
    date: SelectMenuSchemaWithOptions(
      Object.keys(
        ServiceSearchDateFilter.AvailableStates,
      ) as DateFilterStateKey[],
    ),
    tag: SelectMenuSchemaWithOptions(['tag']),
  }),
});
