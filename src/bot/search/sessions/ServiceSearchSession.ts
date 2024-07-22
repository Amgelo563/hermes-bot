import type {
  NyxBot,
  SessionStartInteraction,
  SessionUpdateInteraction,
} from '@nyx-discord/core';
import { IllegalStateError } from '@nyx-discord/core';
import {
  AbstractListPaginationSession,
  ActionRowList,
} from '@nyx-discord/framework';
import type {
  AnySelectMenuInteraction,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import { nanoid } from 'nanoid';

import type { GeneralMessagesParser } from '../../../hermes/message/messages/general/GeneralMessagesParser';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagData } from '../../../tag/data/TagData';
import type { TagMessagesParser } from '../../../tag/message/TagMessagesParser';
import type { FilterableService } from './filter/FilterableService';
import { ServiceSearchDateFilter } from './filter/filters/ServiceSearchDateFilter';
import { ServiceSearchTagFilter } from './filter/filters/ServiceSearchTagFilter';
import type { ServiceSearchFilter } from './filter/ServiceSearchFilter';
import type { ServiceSearchFilterKeyType } from './filter/ServiceSearchFilterKey';
import { ServiceSearchFilterKeyEnum } from './filter/ServiceSearchFilterKey';

export class ServiceSearchSession<
  Item extends FilterableService,
> extends AbstractListPaginationSession<Item, void> {
  public static readonly FilterIDIndex: number = 0;

  protected readonly filters: Record<
    ServiceSearchFilterKeyType,
    ServiceSearchFilter<Item>
  >;

  protected filterMenusCache: Record<
    ServiceSearchFilterKeyType,
    StringSelectMenuBuilder
  > | null = null;

  protected readonly member: HermesMember;

  protected embedFactory: (items: Item[]) => EmbedBuilder;

  protected filteredItems: Item[];

  constructor(
    bot: NyxBot,
    startInteraction: SessionStartInteraction,
    member: HermesMember,
    items: Item[],
    filters: Record<ServiceSearchFilterKeyType, ServiceSearchFilter<Item>>,
    embedFactory: (items: Item[]) => EmbedBuilder,
  ) {
    super(bot, nanoid(5), startInteraction, items);
    this.member = member;
    this.filters = filters;
    this.filteredItems = items;
    this.embedFactory = embedFactory;
  }

  public static create<Item extends FilterableService>(
    bot: NyxBot,
    interaction: SessionStartInteraction,
    member: HermesMember,
    items: Item[],
    tags: TagData[],
    embedFactory: (items: Item[]) => EmbedBuilder,
    generalMessages: GeneralMessagesParser,
    tagMessages: TagMessagesParser,
  ): ServiceSearchSession<Item> {
    const filters = {
      [ServiceSearchFilterKeyEnum.Tags]: new ServiceSearchTagFilter(
        generalMessages,
        tagMessages,
        tags,
      ),
      [ServiceSearchFilterKeyEnum.Date]: new ServiceSearchDateFilter(
        generalMessages,
      ),
    };

    return new ServiceSearchSession(
      bot,
      interaction,
      member,
      items,
      filters,
      embedFactory,
    );
  }

  public async onStart(): Promise<void> {
    await this.startInteraction.deferReply({ ephemeral: true });

    const embed = this.embedFactory(this.filteredItems);
    const components = this.buildRows();

    await this.startInteraction.editReply({
      embeds: [embed],
      components,
    });
  }

  public async onEnd(): Promise<void> {
    const message = await this.startInteraction.fetchReply();
    const rowList = ActionRowList.fromMessage(message).setDisabled(true);

    await this.startInteraction.editReply({
      components: rowList.toRowsData(),
    });
  }

  protected async updatePage(
    interaction: SessionUpdateInteraction,
  ): Promise<boolean> {
    await interaction.deferUpdate();

    const embed = this.embedFactory(this.filteredItems);
    const components = this.buildRows();

    await interaction.editReply({ embeds: [embed], components });

    return true;
  }

  protected async handleSelectMenu(
    interaction: AnySelectMenuInteraction,
  ): Promise<boolean> {
    if (!interaction.isStringSelectMenu()) return true;
    const iterator = this.codec.createIteratorFromCustomId(
      interaction.customId,
    );
    if (!iterator) return true;

    const iteratorValue = iterator.get();
    if (!(iteratorValue in ServiceSearchFilterKeyEnum)) {
      throw new IllegalStateError();
    }

    const filterKey = iteratorValue as ServiceSearchFilterKeyType;
    this.filters[filterKey].update(interaction);
    if (this.filterMenusCache) {
      const selectedOptions = interaction.values;
      const cachedOptions = this.filterMenusCache[filterKey].options;
      this.filterMenusCache[filterKey].setOptions(
        cachedOptions.map((option) => {
          return option.setDefault(
            selectedOptions.includes(option.data.value as string),
          );
        }),
      );
    }

    const filteredItems: Item[] = [...this.items];
    for (const filter of Object.values(this.filters)) {
      if (!filteredItems.length) break;

      for (const item of filteredItems) {
        if (await filter.check(item)) continue;

        filteredItems.splice(filteredItems.indexOf(item), 1);
        if (!filteredItems.length) break;
      }
    }

    this.filteredItems = filteredItems;
    this.currentPage = 0;

    await this.updatePage(interaction);

    return true;
  }

  protected buildRows(): ActionRowBuilder<
    StringSelectMenuBuilder | ButtonBuilder
  >[] {
    return [
      new ActionRowBuilder(this.buildDefaultPageRow()),
      ...this.createFilterRows(),
    ];
  }

  protected createFilterRows(): ActionRowBuilder<StringSelectMenuBuilder>[] {
    let selects = this.filterMenusCache;
    if (!selects) {
      selects = {} as Record<
        ServiceSearchFilterKeyType,
        StringSelectMenuBuilder
      >;

      for (const [id, filter] of Object.entries(this.filters) as [
        ServiceSearchFilterKeyType,
        ServiceSearchFilter<Item>,
      ][]) {
        const customId = this.codec
          .createCustomIdBuilder(this)
          .setAt(ServiceSearchSession.FilterIDIndex, id)
          .build();

        selects[id] = filter.buildSelectMenu(this.member).setCustomId(customId);
      }

      this.filterMenusCache = selects;
    }

    return Object.values(selects).map((menu) =>
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),
    );
  }
}
