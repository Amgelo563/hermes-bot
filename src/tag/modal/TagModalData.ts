import type { TextInputBuilder } from '@discordjs/builders';
import type { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';

export type TagModalData = {
  modal: SimplifiedModalBuilder;
  fields: {
    name: TextInputBuilder;
    description: TextInputBuilder;
    color: TextInputBuilder;
  };
};
