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
import type { RequestData } from '../../service/request/RequestData';
import type { RequestConfig } from '../config/RequestConfigSchema';
import type { RequestMessagesParser } from '../message/RequestMessagesParser';

export class DiscordRequestAgent {
  protected readonly messages: RequestMessagesParser;

  protected readonly requestConfig: RequestConfig;

  protected readonly discordConfig: DiscordConfig;

  protected requestChannel: TextBasedChannel | null = null;

  protected errorChannel: TextBasedChannel | null = null;

  protected logChannel: TextBasedChannel | null = null;

  constructor(
    requestConfig: RequestConfig,
    discordConfig: DiscordConfig,
    messages: RequestMessagesParser,
  ) {
    this.requestConfig = requestConfig;
    this.discordConfig = discordConfig;
    this.messages = messages;
  }

  public static create(
    config: HermesConfig,
    messages: RequestMessagesParser,
  ): DiscordRequestAgent {
    return new DiscordRequestAgent(config.request, config.discord, messages);
  }

  public start(guild: Guild) {
    const requestChannel = guild.channels.cache.get(this.requestConfig.channel);
    if (!requestChannel) {
      throw new ObjectNotFoundError(
        'Request channel not found: ' + this.requestConfig.channel,
      );
    }
    if (!requestChannel.isTextBased()) {
      throw new AssertionError(
        'Request channel is not a text channel: ' + this.requestConfig.channel,
      );
    }
    this.requestChannel = requestChannel;

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

    if (!this.requestConfig.log) return;

    const logChannel = guild.channels.cache.get(this.requestConfig.log.channel);
    if (!logChannel) {
      throw new ObjectNotFoundError(
        'Log channel not found: ' + this.requestConfig.log.channel,
      );
    }
    if (!logChannel.isTextBased()) {
      throw new AssertionError(
        'Log channel is not a text channel: ' + this.requestConfig.log.channel,
      );
    }
    this.logChannel = logChannel;
  }

  public async postRequest(user: User, request: RequestData): Promise<Message> {
    if (!this.requestChannel) {
      throw new IllegalStateError(
        "Request channel not found, haven't started yet?",
      );
    }

    const context = { user, services: { request } };
    const embed = this.messages.getPostEmbed(context);

    return this.requestChannel.send({ embeds: [embed] });
  }

  public async deleteRequest(request: RequestData): Promise<Message | null> {
    if (!this.requestChannel) {
      throw new IllegalStateError(
        "Request channel not found, haven't started yet?",
      );
    }

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

  public async repostRequest(request: RequestData): Promise<Message> {
    if (!this.requestChannel) {
      throw new IllegalStateError(
        "Request channel not found, haven't started yet?",
      );
    }

    const user = await this.requestChannel.client.users.fetch(request.userId);
    /**
     * Worst case scenario the post succeeds but the delete fails,
     * making a duplicate post. I preferred this over the alternative of "delete successful,
     * post failed" because it's more user-friendly, and we can still delete the duplicate manually.
     */
    const newPost = await this.postRequest(user, request);
    await this.deleteRequest(request);

    return newPost;
  }

  public async refreshRequest(request: RequestData): Promise<void> {
    if (!this.requestChannel) {
      throw new IllegalStateError(
        "Request channel not found, haven't started yet?",
      );
    }

    const user = await this.requestChannel.client.users.fetch(request.userId);
    const context = {
      user,
      services: {
        request,
      },
    };

    const message = await this.requestChannel.messages.fetch(request.messageId);
    const embed = this.messages.getPostEmbed(context);

    await message.edit({ embeds: [embed] });
  }

  public async postError(embed: EmbedBuilder): Promise<Message> {
    if (!this.errorChannel) {
      throw new IllegalStateError(
        "Error log channel not found, haven't started yet?",
      );
    }

    return this.errorChannel.send({ embeds: [embed] });
  }

  public async postUpdateLog(
    user: User,
    newRequest: RequestData,
    oldRequest: RequestData,
  ): Promise<void> {
    if (!this.requestConfig.log || !this.requestConfig.log.update) return;

    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const newContext = {
      user,
      services: {
        request: newRequest,
      },
    };
    const oldContext = {
      user,
      services: {
        request: oldRequest,
      },
    };

    const affected = await this.logChannel.client.users.fetch(
      newRequest.userId,
    );

    const updateContext = {
      ...newContext,
      update: {
        affected,
        updater: user,
        new: newRequest,
        old: oldRequest,
      },
    } satisfies HermesPlaceholderContext;

    const updateEmbed = this.messages.getUpdateLogEmbed(updateContext);
    const oldPost = this.messages.getPostEmbed(oldContext);
    const newPost = this.messages.getPostEmbed(newContext);

    await this.logChannel.send({ embeds: [updateEmbed, oldPost, newPost] });
  }

  public async postDeleteLog(user: User, request: RequestData): Promise<void> {
    if (!this.requestConfig.log || !this.requestConfig.log.delete) return;

    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const affected = await this.logChannel.client.users.fetch(request.userId);

    const context = {
      user,
      services: {
        request,
      },
    };

    const updateContext = {
      ...context,
      update: {
        affected,
        updater: user,
        new: {},
        old: request,
      },
    } satisfies HermesPlaceholderContext;

    const deleteEmbed = this.messages.getDeleteLogEmbed(updateContext);
    const postEmbed = this.messages.getPostEmbed(context);

    await this.logChannel.send({ embeds: [deleteEmbed, postEmbed] });
  }
}
