import {
  AssertionError,
  IllegalStateError,
  ObjectNotFoundError,
} from '@nyx-discord/core';
import type {
  EmbedBuilder,
  Guild,
  Message,
  TextBasedChannel,
  User,
} from 'discord.js';

import type { DiscordConfig } from '../../config/discord/DiscordConfigSchema';
import type { HermesConfig } from '../../config/HermesConfigSchema';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { OfferData } from '../../service/offer/OfferData';
import type { OfferConfig } from '../config/OfferConfigSchema';
import type { OfferMessagesParser } from '../message/OfferMessagesParser';

export class DiscordOfferAgent {
  protected readonly messages: OfferMessagesParser;

  protected readonly offerConfig: OfferConfig;

  protected readonly discordConfig: DiscordConfig;

  protected offerChannel: TextBasedChannel | null = null;

  protected errorChannel: TextBasedChannel | null = null;

  protected logChannel: TextBasedChannel | null = null;

  constructor(
    offerConfig: OfferConfig,
    discordConfig: DiscordConfig,
    messages: OfferMessagesParser,
  ) {
    this.offerConfig = offerConfig;
    this.discordConfig = discordConfig;
    this.messages = messages;
  }

  public static create(
    config: HermesConfig,
    messages: OfferMessagesParser,
  ): DiscordOfferAgent {
    return new DiscordOfferAgent(config.offer, config.discord, messages);
  }

  public start(guild: Guild) {
    const offerChannel = guild.channels.cache.get(this.offerConfig.channel);
    if (!offerChannel) {
      throw new ObjectNotFoundError(
        'Offer channel not found: ' + this.offerConfig.channel,
      );
    }
    if (!offerChannel.isTextBased()) {
      throw new AssertionError(
        'Offer channel is not a text channel: ' + this.offerConfig.channel,
      );
    }
    this.offerChannel = offerChannel;

    const errorChannel = guild.channels.cache.get(
      this.discordConfig.errorLogChannel,
    );
    if (!errorChannel) {
      throw new ObjectNotFoundError(
        'Error log channel not found: ' + this.discordConfig.errorLogChannel,
      );
    }
    if (!errorChannel.isTextBased()) {
      throw new AssertionError(
        'Error log channel is not a text channel: '
          + this.discordConfig.errorLogChannel,
      );
    }
    this.errorChannel = errorChannel;

    if (!this.offerConfig.log) return;

    const logChannel = guild.channels.cache.get(this.offerConfig.log.channel);
    if (!logChannel) {
      throw new ObjectNotFoundError(
        'Log channel not found: ' + this.offerConfig.log.channel,
      );
    }
    if (!logChannel.isTextBased()) {
      throw new AssertionError(
        'Log channel is not a text channel: ' + this.offerConfig.log.channel,
      );
    }
    this.logChannel = logChannel;
  }

  public async postOffer(user: User, offer: OfferData): Promise<Message> {
    if (!this.offerChannel) {
      throw new IllegalStateError(
        "Offer channel not found, haven't started yet?",
      );
    }

    const context = { user, services: { offer } };
    const embed = this.messages.getPostEmbed(context);

    return this.offerChannel.send({ embeds: [embed] });
  }

  public async deleteOffer(offer: OfferData): Promise<Message | null> {
    if (!this.offerChannel) {
      throw new IllegalStateError(
        "Offer channel not found, haven't started yet?",
      );
    }

    let offerMessage;
    try {
      offerMessage = await this.offerChannel.messages.fetch(offer.messageId);
    } catch (e) {
      return null;
    }

    await offerMessage.delete();
    return offerMessage;
  }

  public async repostOffer(offer: OfferData): Promise<Message> {
    if (!this.offerChannel) {
      throw new IllegalStateError(
        "Offer channel not found, haven't started yet?",
      );
    }

    const user = await this.offerChannel.client.users.fetch(offer.userId);
    /**
     * Worst case scenario the post succeeds but the delete fails,
     * making a duplicate post. I preferred this over the alternative of "delete successful,
     * post failed" because it's more user-friendly, and we can still delete the duplicate manually.
     */
    const newPost = await this.postOffer(user, offer);
    await this.deleteOffer(offer);

    return newPost;
  }

  public async refreshOffer(offer: OfferData): Promise<void> {
    if (!this.offerChannel) {
      throw new IllegalStateError(
        "Offer channel not found, haven't started yet?",
      );
    }

    const user = await this.offerChannel.client.users.fetch(offer.userId);
    const context = {
      user,
      services: {
        offer,
      },
    };

    const message = await this.offerChannel.messages.fetch(offer.messageId);
    const embed = this.messages.getPostEmbed(context);

    await message.edit({ embeds: [embed] });
  }

  public postError(embed: EmbedBuilder): Promise<Message> {
    if (!this.errorChannel) {
      throw new IllegalStateError(
        "Error log channel not found, haven't started yet?",
      );
    }

    return this.errorChannel.send({ embeds: [embed] });
  }

  public async postUpdateLog(
    user: User,
    newOffer: OfferData,
    oldOffer: OfferData,
  ): Promise<void> {
    if (!this.offerConfig.log || !this.offerConfig.log.update) return;

    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const newContext = {
      user,
      services: {
        offer: newOffer,
      },
    };
    const oldContext = {
      user,
      services: {
        offer: oldOffer,
      },
    };

    const affected = await this.logChannel.client.users.fetch(newOffer.userId);

    const updateContext = {
      ...newContext,
      update: {
        affected,
        updater: user,
        new: newOffer,
        old: oldOffer,
      },
    } satisfies HermesPlaceholderContext;

    const updateEmbed = this.messages.getUpdateLogEmbed(updateContext);
    const oldPost = this.messages.getPostEmbed(oldContext);
    const newPost = this.messages.getPostEmbed(newContext);

    await this.logChannel.send({ embeds: [updateEmbed, oldPost, newPost] });
  }

  public async postDeleteLog(user: User, offer: OfferData): Promise<void> {
    if (!this.offerConfig.log || !this.offerConfig.log.delete) return;

    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const affected = await this.logChannel.client.users.fetch(offer.userId);

    const context = {
      user,
      services: {
        offer,
      },
    };

    const updateContext = {
      ...context,
      update: {
        affected,
        updater: user,
        new: {},
        old: offer,
      },
    } satisfies HermesPlaceholderContext;

    const deleteEmbed = this.messages.getDeleteLogEmbed(updateContext);
    const postEmbed = this.messages.getPostEmbed(context);

    await this.logChannel.send({ embeds: [deleteEmbed, postEmbed] });
  }
}
