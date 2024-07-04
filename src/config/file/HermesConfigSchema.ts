import { z } from 'zod';

import { BlacklistConfigSchema } from '../../blacklist/config/BlacklistConfigSchema';
import { OfferConfigSchema } from '../../offer/config/OfferConfigSchema';
import { RequestConfigSchema } from '../../request/config/RequestConfigSchema';
import { TagConfigSchema } from '../../tag/config/TagConfigSchema';
import { DiscordConfigSchema } from '../configs/discord/DiscordConfigSchema';
import { GeneralConfigSchema } from '../configs/general/GeneralConfigSchema';

export const HermesConfigSchema = z.object({
  general: GeneralConfigSchema,
  tags: TagConfigSchema,
  discord: DiscordConfigSchema,
  offer: OfferConfigSchema,
  request: RequestConfigSchema,
  blacklist: BlacklistConfigSchema,
});

export type HermesConfig = z.infer<typeof HermesConfigSchema>;
