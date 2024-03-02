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
import type { TagData } from '../../service/tag/TagData';
import type { TagConfig } from '../config/TagConfigSchema';
import type { TagMessagesParser } from '../message/TagMessagesParser';

export class DiscordTagAgent {
  protected readonly tagConfig: TagConfig;

  protected readonly discordConfig: DiscordConfig;

  protected readonly messages: TagMessagesParser;

  protected logChannel: TextBasedChannel | null = null;

  protected errorChannel: TextBasedChannel | null = null;

  constructor(
    messages: TagMessagesParser,
    tagConfig: TagConfig,
    discordConfig: DiscordConfig,
  ) {
    this.messages = messages;
    this.tagConfig = tagConfig;
    this.discordConfig = discordConfig;
  }

  public static create(
    messages: TagMessagesParser,
    config: HermesConfig,
  ): DiscordTagAgent {
    return new DiscordTagAgent(messages, config.tags, config.discord);
  }

  public start(guild: Guild) {
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

    if (!this.tagConfig.log) return;

    const logChannel = guild.channels.cache.get(this.tagConfig.log.channel);
    if (!logChannel) {
      throw new ObjectNotFoundError(
        'Log channel not found: ' + this.tagConfig.log.channel,
      );
    }
    if (!logChannel.isTextBased()) {
      throw new AssertionError(
        'Log channel is not a text channel: ' + this.tagConfig.log.channel,
      );
    }
    this.logChannel = logChannel;
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
    oldTag: TagData,
    newTag: TagData,
  ): Promise<void> {
    if (!this.tagConfig.log || !this.tagConfig.log.update) return;
    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const oldContext = {
      user,
      services: {
        tag: oldTag,
      },
    } satisfies HermesPlaceholderContext;
    const newContext = {
      user,
      services: {
        tag: newTag,
      },
    } satisfies HermesPlaceholderContext;

    const updateContext = {
      ...newContext,
      update: {
        affected: this.logChannel.client.user,
        updater: user,
        new: newTag,
        old: oldTag,
      },
    } satisfies HermesPlaceholderContext;

    const updateEmbed = this.messages.getUpdateLogEmbed(updateContext);
    const oldInfo = this.messages.getInfoEmbed(oldContext);
    const newInfo = this.messages.getInfoEmbed(newContext);

    await this.logChannel.send({ embeds: [updateEmbed, oldInfo, newInfo] });
  }

  public async postDeleteLog(user: User, tag: TagData): Promise<void> {
    if (!this.tagConfig.log || !this.tagConfig.log.delete) return;
    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const context = {
      user,
      services: {
        tag,
      },
      update: {
        affected: this.logChannel.client.user,
        updater: user,
        new: {},
        old: tag,
      },
    } satisfies HermesPlaceholderContext;

    const deleteEmbed = this.messages.getDeleteLogEmbed(context);
    const infoEmbed = this.messages.getInfoEmbed(context);

    await this.logChannel.send({ embeds: [deleteEmbed, infoEmbed] });
  }

  public async postCreateLog(user: User, tag: TagData): Promise<void> {
    if (!this.tagConfig.log || !this.tagConfig.log.create) return;
    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const context = {
      user,
      services: {
        tag,
      },
      update: {
        affected: this.logChannel.client.user,
        updater: user,
        new: tag,
        old: {},
      },
    } satisfies HermesPlaceholderContext;

    const logEmbed = this.messages.getCreateLogEmbed(context);
    const infoEmbed = this.messages.getInfoEmbed(context);

    await this.logChannel.send({ embeds: [logEmbed, infoEmbed] });
  }
}
