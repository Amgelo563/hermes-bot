import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import type { AutocompleteChoiceSource } from './AutocompleteChoiceSource';

export class PermanentAutocompleteChoiceSource
  implements AutocompleteChoiceSource
{
  protected choices: ApplicationCommandOptionChoiceData[];

  constructor(choices: ApplicationCommandOptionChoiceData[]) {
    this.choices = choices;
  }

  public autocomplete(): ApplicationCommandOptionChoiceData[] {
    return this.choices;
  }

  public setChoices(choices: ApplicationCommandOptionChoiceData[]): void {
    this.choices = choices;
  }
}
