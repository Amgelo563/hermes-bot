import { IllegalStateError } from '@nyx-discord/core';
import type { Client, Guild, Message, TextBasedChannel } from 'discord.js';

import type { DiscordConfig } from '../../config/configs/discord/DiscordConfigSchema';
import type { HermesConfig } from '../../config/file/HermesConfigSchema';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { DiscordServiceAgent } from '../../service/discord/DiscordServiceAgent';
import type { HermesMember } from '../../service/member/HermesMember';
import { HermesMemberTypeEnum } from '../../service/member/HermesMemberType';
import type { RequestConfig } from '../config/RequestConfigSchema';
import type { RequestData } from '../data/RequestData';
import type { RequestDataWithMember } from '../data/RequestDataWithMember';
import type { RequestMessagesParser } from '../message/read/RequestMessagesParser';

export class DiscordRequestAgent extends DiscordServiceAgent {
  protected readonly requestMessages: RequestMessagesParser;

  protected readonly requestConfig: RequestConfig;

  protected readonly discordConfig: DiscordConfig;

  protected requestChannel: TextBasedChannel | null = null;

  protected logChannel: TextBasedChannel | null = null;

  constructor(
    client: Client,
    messages: HermesMessageService,
    discordConfig: DiscordConfig,
    requestConfig: RequestConfig,
  ) {
    super(client, messages, discordConfig);
    this.requestConfig = requestConfig;
    this.discordConfig = discordConfig;
    this.requestMessages = messages.getRequestMessages();
  }

  public static create(
    client: Client,
    messages: HermesMessageService,
    config: HermesConfig,
  ): DiscordRequestAgent {
    return new DiscordRequestAgent(
      client,
      messages,
      config.discord,
      config.request,
    );
  }

  public start() {
    super.start();
    const guild = this.guild as Guild;

    const requestChannel = guild.channels.cache.get(this.requestConfig.channel);
    this.assertTextChannel('Request', requestChannel, true);
    this.requestChannel = requestChannel;

    if (!this.requestConfig.log) return;

    const logChannel = guild.channels.cache.get(this.requestConfig.log.channel);
    this.assertTextChannel('Request Log', logChannel);

    this.logChannel = logChannel;
  }

  public async postRequest(
    user: HermesMember | string,
    request: RequestDataWithMember,
  ): Promise<Message> {
    this.assertTextChannel('Request', this.requestChannel, true);

    const member =
      typeof user === 'string' ? await this.fetchMember(user, true) : user;
    if (member.type === HermesMemberTypeEnum.Mock) {
      throw new IllegalStateError('Member not found: ' + member.id);
    }

    const context = { member, services: { request } };
    const embed = this.requestMessages.getPostEmbed(context);

    return this.requestChannel.send({ embeds: [embed] });
  }

  public async deleteRequest(request: RequestData): Promise<Message | null> {
    this.assertTextChannel('Request', this.requestChannel, true);

    let requestMessage;
    try {
      requestMessage = await this.requestChannel.messages.fetch(
        request.messageId,
      );
    } catch (e) {
      return null;
    }

    await requestMessage.delete();
    return requestMessage;
  }

  public async repostRequest(request: RequestDataWithMember): Promise<Message> {
    this.assertTextChannel('Request', this.requestChannel, true);

    /**
     * Worst case scenario the post succeeds but the delete fails,
     * making a duplicate post. I preferred this over the alternative of "delete successful,
     * post failed" because it's more user-friendly, and we can still delete the duplicate manually.
     */
    const newPost = await this.postRequest(request.memberId, request);
    await this.deleteRequest(request);

    return newPost;
  }

  public async refreshRequest(request: RequestDataWithMember): Promise<void> {
    this.assertTextChannel('Request', this.requestChannel, true);

    const member =
      (await this.fetchMember(request.memberId))
      ?? this.getUnknownMember(request.memberId);
    const context = {
      member,
      services: {
        request,
      },
    };

    let message;
    try {
      message = await this.requestChannel.messages.fetch(request.messageId);
    } catch (e) {
      message = await this.postRequest(member, request);
    }

    const embed = this.requestMessages.getPostEmbed(context);
    await message.edit({ embeds: [embed] });
  }

  public async postUpdateLog(
    updater: HermesMember | string,
    newRequest: RequestDataWithMember,
    oldRequest: RequestDataWithMember,
  ): Promise<void> {
    if (!this.requestConfig.log || !this.requestConfig.log.update) return;

    this.assertTextChannel('Request Log', this.logChannel);

    const updaterMember =
      typeof updater === 'string'
        ? await this.fetchMember(updater, true)
        : updater;
    const ownerMember =
      (await this.fetchMember(newRequest.memberId))
      ?? this.getUnknownMember(newRequest.memberId);

    const newContext = {
      member: ownerMember,
      services: {
        request: newRequest,
      },
    };
    const oldContext = {
      member: ownerMember,
      services: {
        request: oldRequest,
      },
    };

    const updateContext = {
      ...newContext,
      member: updaterMember,
      update: {
        affected: ownerMember,
        updater: updaterMember,
        new: newRequest,
        old: oldRequest,
      },
    } satisfies HermesPlaceholderContext;

    const updateEmbed = this.requestMessages.getUpdateLogEmbed(updateContext);
    const oldPost = this.requestMessages.getPostEmbed(oldContext);
    const newPost = this.requestMessages.getPostEmbed(newContext);

    await this.logChannel.send({ embeds: [updateEmbed, oldPost, newPost] });
  }

  public async postDeleteLog(
    deleter: HermesMember | string,
    request: RequestDataWithMember,
  ): Promise<void> {
    if (!this.requestConfig.log || !this.requestConfig.log.delete) return;

    this.assertTextChannel('Request Log', this.logChannel);

    const ownerMember =
      (await this.fetchMember(request.memberId))
      ?? this.getUnknownMember(request.memberId);
    const deleterMember =
      typeof deleter === 'string'
        ? await this.fetchMember(deleter, true)
        : deleter;

    const context = {
      member: ownerMember,
      services: {
        request,
      },
    };

    const updateContext = {
      ...context,
      member: deleterMember,
      update: {
        affected: ownerMember,
        updater: deleterMember,
        new: {},
        old: request,
      },
    } satisfies HermesPlaceholderContext;

    const deleteEmbed = this.requestMessages.getDeleteLogEmbed(updateContext);
    const postEmbed = this.requestMessages.getPostEmbed(context);

    await this.logChannel.send({ embeds: [deleteEmbed, postEmbed] });
  }
}
