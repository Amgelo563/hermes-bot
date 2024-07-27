import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
} from 'discord.js';
import fuzzysort from 'fuzzysort';

import type { AutocompleteChoiceSource } from './AutocompleteChoiceSource';

export class PermanentAutocompleteChoiceSource
  implements AutocompleteChoiceSource
{
  protected choices: ApplicationCommandOptionChoiceData[];

  constructor(choices: ApplicationCommandOptionChoiceData[]) {
    this.choices = choices;
  }

  public autocomplete(
    interaction: AutocompleteInteraction,
  ): ApplicationCommandOptionChoiceData[] {
    return this.fuzzySearch(interaction, this.choices);
  }

  public setChoices(choices: ApplicationCommandOptionChoiceData[]): void {
    this.choices = choices;
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
