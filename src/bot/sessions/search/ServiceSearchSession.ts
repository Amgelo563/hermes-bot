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
  ActionRow,
  AnySelectMenuInteraction,
  ButtonBuilder,
  ButtonComponent,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuComponent,
} from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import { nanoid } from 'nanoid';

import type { TagData } from '../../../tag/data/TagData';
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

  protected embedFactory: (items: Item[]) => EmbedBuilder;

  protected filteredItems: Item[];

  constructor(
    bot: NyxBot,
    startInteraction: SessionStartInteraction,
    items: Item[],
    filters: Record<ServiceSearchFilterKeyType, ServiceSearchFilter<Item>>,
    embedFactory: (items: Item[]) => EmbedBuilder,
  ) {
    super(bot, nanoid(5), startInteraction, items);
    this.filters = filters;
    this.filteredItems = items;
    this.embedFactory = embedFactory;
  }

  public static create<Item extends FilterableService>(
    bot: NyxBot,
    interaction: SessionStartInteraction,
    items: Item[],
    tags: TagData[],
    embedFactory: (items: Item[]) => EmbedBuilder,
  ): ServiceSearchSession<Item> {
    const filters = {
      [ServiceSearchFilterKeyEnum.Tags]: new ServiceSearchTagFilter(tags),
      [ServiceSearchFilterKeyEnum.Date]: new ServiceSearchDateFilter(),
    };

    return new ServiceSearchSession(
      bot,
      interaction,
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
    const message =
      interaction.deferred || interaction.replied
        ? interaction.message
        : await interaction.deferUpdate({ fetchReply: true });

    const embed = this.embedFactory(this.filteredItems);
    const components = this.buildRows(
      message.components as ActionRow<
        ButtonComponent | StringSelectMenuComponent
      >[],
    );

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
    if (!(iteratorValue in ServiceSearchFilterKeyEnum))
      throw new IllegalStateError();

    const filterKey = iteratorValue as ServiceSearchFilterKeyType;
    this.filters[filterKey].update(interaction);

    const filteredItems: Item[] = this.items;
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

  protected buildRows(
    current?: ActionRow<ButtonComponent | StringSelectMenuComponent>[],
  ): ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] {
    if (current) {
      const newRows: (
        | ActionRow<ButtonComponent | StringSelectMenuComponent>
        | ActionRowBuilder<ButtonBuilder>
      )[] = [...current];
      newRows[0] = new ActionRowBuilder(this.buildDefaultPageRow());

      return newRows.map((row) => ActionRowBuilder.from(row));
    }

    return [
      new ActionRowBuilder(this.buildDefaultPageRow()),
      ...this.createFilterRows(),
    ];
  }

  protected createFilterRows(): ActionRowBuilder<StringSelectMenuBuilder>[] {
    const rows: ActionRowBuilder<StringSelectMenuBuilder>[] = [];

    for (const [id, filter] of Object.entries(this.filters)) {
      const customId = this.codec
        .createCustomIdBuilder(this)
        .setAt(ServiceSearchSession.FilterIDIndex, id)
        .build();

      const selectMenu = filter.buildSelectMenu().setCustomId(customId);
      rows.push(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          selectMenu,
        ),
      );
    }

    return rows;
  }

  /**
   * Pagination / Cancel
   * Date
   * Tags
   * Ranking
   */
}
