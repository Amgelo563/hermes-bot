import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  Awaitable,
} from 'discord.js';

export interface AutocompleteChoiceSource {
  autocomplete(
    interaction: AutocompleteInteraction,
  ): Awaitable<ApplicationCommandOptionChoiceData[]>;
}
