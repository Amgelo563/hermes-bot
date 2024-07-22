import type { StringSelectMenuBuilder } from 'discord.js';
import { type StringSelectMenuInteraction } from 'discord.js';

import type { GeneralMessagesParser } from '../../../../../hermes/message/messages/general/GeneralMessagesParser';
import type { HermesMember } from '../../../../../service/member/HermesMember';
import type { TagData } from '../../../../../tag/data/TagData';
import type { TagMessagesParser } from '../../../../../tag/message/TagMessagesParser';
import type { FilterableService } from '../FilterableService';
import type { ServiceSearchFilter } from '../ServiceSearchFilter';

type TagWithStringId = TagData & { id: string };

export class ServiceSearchTagFilter
  implements ServiceSearchFilter<FilterableService>
{
  protected state: Set<string> | null = null;

  protected readonly generalMessages: GeneralMessagesParser;

  protected readonly tagMessages: TagMessagesParser;

  protected readonly availableTags: TagWithStringId[];

  constructor(
    generalMessages: GeneralMessagesParser,
    tagMessages: TagMessagesParser,
    availableTags: TagData[],
  ) {
    this.generalMessages = generalMessages;
    this.tagMessages = tagMessages;
    this.availableTags = availableTags.map(
      (tag) =>
        ({
          ...tag,
          id: tag.id.toString(),
        }) as TagWithStringId,
    );
  }

  public buildSelectMenu(member: HermesMember): StringSelectMenuBuilder {
    const placeholder = this.generalMessages.getTagFilterSelectMenuPlaceholder({
      member,
    });

    const select = this.tagMessages
      .getListSelect({ member }, this.availableTags)
      .setPlaceholder(placeholder)
      .setMaxValues(this.availableTags.length);

    select.addOptions(
      this.availableTags.map((tag) => ({
        label: tag.name,
        description: tag.description,
        value: tag.id,
      })),
    );

    return select;
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
