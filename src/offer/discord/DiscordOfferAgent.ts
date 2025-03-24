import { IllegalStateError } from '@nyx-discord/core';
import type { Client, Guild, Message, TextBasedChannel } from 'discord.js';

import type { DiscordConfig } from '../../config/configs/discord/DiscordConfigSchema';
import type { HermesConfig } from '../../config/file/HermesConfigSchema';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { DiscordServiceAgent } from '../../service/discord/DiscordServiceAgent';
import type { HermesMember } from '../../service/member/HermesMember';
import type { OfferConfig } from '../config/OfferConfigSchema';
import type { OfferData } from '../data/OfferData';
import type { OfferDataWithMember } from '../data/OfferDataWithMember';
import type { OfferMessagesParser } from '../message/read/OfferMessagesParser';

export class DiscordOfferAgent extends DiscordServiceAgent {
  protected readonly offerMessages: OfferMessagesParser;

  protected readonly offerConfig: OfferConfig;

  protected readonly discordConfig: DiscordConfig;

  protected offerChannel: TextBasedChannel | null = null;

  protected logChannel: TextBasedChannel | null = null;

  constructor(
    client: Client,
    discordConfig: DiscordConfig,
    messages: HermesMessageService,
    offerConfig: OfferConfig,
  ) {
    super(client, messages, discordConfig);

    this.offerConfig = offerConfig;
    this.discordConfig = discordConfig;
    this.offerMessages = messages.getOfferMessages();
  }

  public static create(
    client: Client,
    messages: HermesMessageService,
    config: HermesConfig,
  ): DiscordOfferAgent {
    return new DiscordOfferAgent(
      client,
      config.discord,
      messages,
      config.offer,
    );
  }

  public start() {
    super.start();
    const guild = this.guild as Guild;
    const offerChannel = guild.channels.cache.get(this.offerConfig.channel);
    this.assertTextChannel('Offer', offerChannel);

    this.offerChannel = offerChannel;

    if (!this.offerConfig.log) return;

    const logChannel = guild.channels.cache.get(this.offerConfig.log.channel);
    this.assertTextChannel('Offer Log', logChannel);

    this.logChannel = logChannel;
  }

  public async postOffer(
    poster: HermesMember | string,
    offer: OfferDataWithMember,
  ): Promise<Message> {
    this.assertTextChannel('Offer', this.offerChannel, true);

    const member =
      typeof poster === 'string'
        ? await this.fetchMember(poster, true)
        : poster;
    const context = { member, services: { offer } };
    const embed = this.offerMessages.getPostEmbed(context);

    return this.offerChannel.send({ embeds: [embed] });
  }

  public async deleteOffer(offer: OfferData): Promise<Message | null> {
    this.assertTextChannel('Offer', this.offerChannel, true);

    let offerMessage;
    try {
      offerMessage = await this.offerChannel.messages.fetch({
        message: offer.messageId,
        force: true,
      });
    } catch (e) {
      return null;
    }

    await offerMessage.delete();
    return offerMessage;
  }

  public async repostOffer(offer: OfferDataWithMember): Promise<Message> {
    this.assertTextChannel('Offer', this.offerChannel, true);

    const member = await this.fetchMember(offer.memberId, true);
    /**
     * Worst case scenario the post succeeds but the delete fails,
     * making a duplicate post. I preferred this over the alternative of "delete successful,
     * post failed" because it's more user-friendly, and we can still delete the duplicate manually.
     */
    const newPost = await this.postOffer(member, offer);
    await this.deleteOffer(offer);

    return newPost;
  }

  public async refreshOffer(offer: OfferDataWithMember): Promise<void> {
    if (!this.offerChannel) {
      throw new IllegalStateError(
        "Offer channel not found, haven't started yet?",
      );
    }

    const member =
      (await this.fetchMember(offer.memberId))
      ?? this.getUnknownMember(offer.memberId);
    const context = {
      member,
      services: {
        offer,
      },
    };

    const message = await this.offerChannel.messages.fetch(offer.messageId);
    const embed = this.offerMessages.getPostEmbed(context);

    await message.edit({ embeds: [embed] });
  }

  public async postUpdateLog(
    updater: HermesMember | string,
    newOffer: OfferDataWithMember,
    oldOffer: OfferDataWithMember,
  ): Promise<void> {
    if (!this.offerConfig.log || !this.offerConfig.log.update) return;

    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const affected =
      (await this.fetchMember(newOffer.memberId))
      ?? this.getUnknownMember(newOffer.memberId);
    const updaterMember =
      typeof updater === 'string'
        ? await this.fetchMember(updater, true)
        : updater;

    const newContext = {
      member: affected,
      services: {
        offer: newOffer,
      },
    };
    const oldContext = {
      member: affected,
      services: {
        offer: oldOffer,
      },
    };

    const updateContext = {
      ...newContext,
      member: updaterMember,
      update: {
        affected,
        updater: updaterMember,
        new: newOffer,
        old: oldOffer,
      },
    } satisfies HermesPlaceholderContext;

    const updateEmbed = this.offerMessages.getUpdateLogEmbed(updateContext);
    const oldPost = this.offerMessages.getPostEmbed(oldContext);
    const newPost = this.offerMessages.getPostEmbed(newContext);

    await this.logChannel.send({ embeds: [updateEmbed, oldPost, newPost] });
  }

  public async postDeleteLog(
    deleter: HermesMember | string,
    offer: OfferDataWithMember,
  ): Promise<void> {
    if (!this.offerConfig.log || !this.offerConfig.log.delete) return;

    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const affected =
      (await this.fetchMember(offer.memberId))
      ?? this.getUnknownMember(offer.memberId);
    const deleterMember =
      typeof deleter === 'string'
        ? await this.fetchMember(deleter, true)
        : deleter;

    const context = {
      member: affected,
      services: {
        offer,
      },
    };

    const deleteContext = {
      ...context,
      member: deleterMember,
      update: {
        affected,
        updater: deleterMember,
        new: {},
        old: offer,
      },
    } satisfies HermesPlaceholderContext;

    const deleteEmbed = this.offerMessages.getDeleteLogEmbed(deleteContext);
    const postEmbed = this.offerMessages.getPostEmbed(context);

    await this.logChannel.send({ embeds: [deleteEmbed, postEmbed] });
  }
}
