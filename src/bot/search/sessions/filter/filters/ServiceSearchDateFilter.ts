import type {
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import type { GeneralMessagesParser } from '../../../../../hermes/message/messages/general/GeneralMessagesParser';
import type { HermesMember } from '../../../../../service/member/HermesMember';

import type { FilterableService } from '../FilterableService';
import type { ServiceSearchFilter } from '../ServiceSearchFilter';

export type DateFilterStateKey =
  keyof typeof ServiceSearchDateFilter.AvailableStates;

export class ServiceSearchDateFilter
  implements ServiceSearchFilter<FilterableService>
{
  public static readonly AvailableStates = {
    LastDay: 1000 * 60 * 60 * 24,
    LastWeek: 1000 * 60 * 60 * 24 * 7,
    LastMonth: 1000 * 60 * 60 * 24 * 30,
    LastYear: 1000 * 60 * 60 * 24 * 365,
  };

  protected state: keyof typeof ServiceSearchDateFilter.AvailableStates | null =
    null;

  protected readonly messages: GeneralMessagesParser;

  constructor(messages: GeneralMessagesParser) {
    this.messages = messages;
  }

  public buildSelectMenu(member: HermesMember): StringSelectMenuBuilder {
    const entries = Object.entries(ServiceSearchDateFilter.AvailableStates).map(
      ([key]) => [key, key],
    );
    const values = Object.fromEntries(entries) as Record<
      DateFilterStateKey,
      string
    >;

    return this.messages
      .getDateFilterSelectMenu({ member }, values)
      .setMaxValues(1);
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
