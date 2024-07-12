import type { TextInputBuilder } from 'discord.js';
import type { SimplifiedModalBuilder } from '../../discord/modal/builder/SimplifiedModalBuilder';

export type OfferModalData = {
  modal: SimplifiedModalBuilder;
  fields: {
    title: TextInputBuilder;
    description: TextInputBuilder;
    price: TextInputBuilder;
    image: TextInputBuilder;
    thumbnail: TextInputBuilder;
  };
};
