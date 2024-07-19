import {
  StringSelectMenuBuilder,
  type StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

import type { TagData } from '../../../../../tag/data/TagData';
import type { FilterableService } from '../FilterableService';
import type { ServiceSearchFilter } from '../ServiceSearchFilter';

type TagWithStringId = TagData & { id: string };

export class ServiceSearchTagFilter
  implements ServiceSearchFilter<FilterableService>
{
  protected state: Set<string> | null = null;

  protected readonly availableTags: TagWithStringId[];

  constructor(availableTags: TagData[]) {
    this.availableTags = availableTags.map(
      (tag) =>
        ({
          ...tag,
          id: tag.id.toString(),
        }) as TagWithStringId,
    );
  }

  public buildSelectMenu(): StringSelectMenuBuilder {
    const options = this.availableTags.map((tag) =>
      new StringSelectMenuOptionBuilder().setLabel(tag.name).setValue(tag.id),
    );

    return new StringSelectMenuBuilder().setOptions(options);
  }

  public update(select: StringSelectMenuInteraction): void {
    const { values } = select;
    if (!values.length) this.state = null;

    this.state = new Set(values);
  }

  public check(item: FilterableService): boolean {
    const state = this.state;
    if (!state) return true;

    if ('tags' in item) {
      return item.tags.some((tag) => state.has(String(tag.id)));
    } else {
      const tag = item.tag;
      if (!tag) return false;

      return state.has(String(tag.id));
    }
  }
}
