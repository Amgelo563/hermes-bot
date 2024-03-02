import { z } from 'zod';

import { OfferConfigSchema } from '../offer/config/OfferConfigSchema';
import { RequestConfigSchema } from '../request/config/RequestConfigSchema';
import { TagConfigSchema } from '../tag/config/TagConfigSchema';
import { DiscordConfigSchema } from './discord/DiscordConfigSchema';
import { GeneralConfigSchema } from './general/GeneralConfigSchema';

export const HermesConfigSchema = z.object({
  general: GeneralConfigSchema,
  tags: TagConfigSchema,
  discord: DiscordConfigSchema,
  offer: OfferConfigSchema,
  request: RequestConfigSchema,
});

export type HermesConfig = z.infer<typeof HermesConfigSchema>;
