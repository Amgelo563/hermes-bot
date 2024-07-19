import type { Filter } from '@nyx-discord/core';
import type {
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';

import type { FilterableService } from './FilterableService';

export type ServiceSearchFilter<Item extends FilterableService> = Filter<
  Item,
  []
> & {
  update(select: StringSelectMenuInteraction): void;
  buildSelectMenu(): StringSelectMenuBuilder;
};
