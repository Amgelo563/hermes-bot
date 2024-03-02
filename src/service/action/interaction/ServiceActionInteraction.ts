import type {
  AnySelectMenuInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { type ChatInputCommandInteraction } from 'discord.js';

export type ServiceActionInteraction =
  | ModalSubmitInteraction
  | AnySelectMenuInteraction
  | ButtonInteraction
  | ChatInputCommandInteraction;
