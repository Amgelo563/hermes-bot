import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  Awaitable,
} from 'discord.js';

export type UserAutocompleteGetter = (
  interaction: AutocompleteInteraction,
) => Awaitable<ApplicationCommandOptionChoiceData[]>;
