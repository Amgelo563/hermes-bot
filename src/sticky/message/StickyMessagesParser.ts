import type { EmbedBuilder } from 'discord.js';

import { BasicHermesMessageParser } from '../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { StickyMessagesSchema } from './StickyMessagesSchema';

export class StickyMessagesParser extends BasicHermesMessageParser<
  typeof StickyMessagesSchema
> {
  public getOfferEmbed(context: HermesPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.offer, context);
  }

  public getRequestEmbed(context: HermesPlaceholderContext): EmbedBuilder {
    return this.parseEmbed(this.messages.request, context);
  }
}
