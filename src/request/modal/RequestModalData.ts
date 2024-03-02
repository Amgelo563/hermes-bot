import type { TextInputBuilder } from '@discordjs/builders';

import type { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';

export type RequestModalData = {
  modal: SimplifiedModalBuilder;
  fields: {
    title: TextInputBuilder;
    description: TextInputBuilder;
    budget: TextInputBuilder;
  };
};
