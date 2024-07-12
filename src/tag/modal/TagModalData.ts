import type { TextInputBuilder } from 'discord.js';
import type { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';

export type TagModalData = {
  modal: SimplifiedModalBuilder;
  fields: {
    name: TextInputBuilder;
    description: TextInputBuilder;
    color: TextInputBuilder;
  };
};
