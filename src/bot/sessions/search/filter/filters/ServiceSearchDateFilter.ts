import type { StringSelectMenuInteraction } from 'discord.js';
import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

import type { FilterableService } from '../FilterableService';
import type { ServiceSearchFilter } from '../ServiceSearchFilter';

export class ServiceSearchDateFilter
  implements ServiceSearchFilter<FilterableService>
{
  protected static readonly AvailableStates = {
    LastDay: 1000 * 60 * 60 * 24,
    LastWeek: 1000 * 60 * 60 * 24 * 7,
    LastMonth: 1000 * 60 * 60 * 24 * 30,
    LastYear: 1000 * 60 * 60 * 24 * 365,
  };

  protected state: keyof typeof ServiceSearchDateFilter.AvailableStates | null =
    null;

  public buildSelectMenu(): StringSelectMenuBuilder {
    const options = Object.keys(ServiceSearchDateFilter.AvailableStates).map(
      (key) => new StringSelectMenuOptionBuilder().setLabel(key).setValue(key),
    );

    return new StringSelectMenuBuilder().setOptions(options).setMaxValues(1);
  }

  public update(select: StringSelectMenuInteraction): void {
    const { values } = select;

    if (!values.length) this.state = null;
    this.state =
      values[0] as keyof typeof ServiceSearchDateFilter.AvailableStates;
  }

  public check(item: FilterableService): boolean {
    if (!this.state) return true;

    const postedAt = item.lastPostedAt;
    const now = new Date();
    const diff = now.getTime() - postedAt.getTime();

    return diff < ServiceSearchDateFilter.AvailableStates[this.state];
  }
}
