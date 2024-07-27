import TTLCache from '@isaacs/ttlcache';
import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
} from 'discord.js';
import fuzzysort from 'fuzzysort';

import type { AutocompleteChoiceSource } from './AutocompleteChoiceSource';
import type { UserAutocompleteGetter } from './user/UserAutocompleteGetter';

export class UserAutocompleteChoiceSource implements AutocompleteChoiceSource {
  protected readonly cache: TTLCache<
    string,
    ApplicationCommandOptionChoiceData[]
  >;

  protected readonly get: UserAutocompleteGetter;

  constructor(
    cache: TTLCache<string, ApplicationCommandOptionChoiceData[]>,
    get: UserAutocompleteGetter,
  ) {
    this.cache = cache;
    this.get = get;
  }

  public static create(
    getter: UserAutocompleteGetter,
  ): UserAutocompleteChoiceSource {
    const cache = new TTLCache<string, ApplicationCommandOptionChoiceData[]>({
      ttl: 1000 * 10, // 10 seconds
      max: 25,
    });

    return new UserAutocompleteChoiceSource(cache, getter);
  }

  public async autocomplete(
    interaction: AutocompleteInteraction,
  ): Promise<ApplicationCommandOptionChoiceData[]> {
    const cached = this.cache.get(interaction.user.id);
    if (cached) {
      return this.fuzzySearch(interaction, cached);
    }

    const result = await this.get(interaction);
    this.cache.set(interaction.user.id, result);

    return this.fuzzySearch(interaction, result);
  }

  protected fuzzySearch(
    interaction: AutocompleteInteraction,
    choices: ApplicationCommandOptionChoiceData[],
  ): ApplicationCommandOptionChoiceData[] {
    const search = interaction.options.getFocused();

    return search.length
      ? fuzzysort
          .go<ApplicationCommandOptionChoiceData>(search, choices, {
            key: 'name',
          })
          .map((res) => res.obj)
      : choices;
  }
}
