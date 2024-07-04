import {
  AssertionError,
  IllegalStateError,
  ObjectNotFoundError,
} from '@nyx-discord/core';
import type { Client, Guild, TextBasedChannel } from 'discord.js';

import type { DiscordConfig } from '../../config/configs/discord/DiscordConfigSchema';
import type { HermesConfig } from '../../config/file/HermesConfigSchema';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { DiscordServiceAgent } from '../../service/discord/DiscordServiceAgent';
import type { HermesMember } from '../../service/member/HermesMember';
import type { TagConfig } from '../config/TagConfigSchema';
import type { TagData } from '../data/TagData';
import type { TagMessagesParser } from '../message/TagMessagesParser';

export class DiscordTagAgent extends DiscordServiceAgent {
  protected readonly tagConfig: TagConfig;

  protected readonly tagMessages: TagMessagesParser;

  protected logChannel: TextBasedChannel | null = null;

  protected errorChannel: TextBasedChannel | null = null;

  constructor(
    client: Client,
    discordConfig: DiscordConfig,
    messages: HermesMessageService,
    tagConfig: TagConfig,
  ) {
    super(client, messages, discordConfig);
    this.tagConfig = tagConfig;
    this.tagMessages = messages.getTagsMessages();
  }

  public static create(
    client: Client,
    messages: HermesMessageService,
    config: HermesConfig,
  ): DiscordTagAgent {
    return new DiscordTagAgent(client, config.discord, messages, config.tags);
  }

  public start() {
    super.start();
    if (!this.tagConfig.log) return;

    const guild = this.guild as Guild;

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

  public async postUpdateLog(
    updater: string | HermesMember,
    oldTag: TagData,
    newTag: TagData,
  ): Promise<void> {
    if (!this.tagConfig.log || !this.tagConfig.log.update) return;
    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const member =
      typeof updater === 'string'
        ? await this.fetchMember(updater, true)
        : updater;
    const oldContext = {
      member,
      services: {
        tag: oldTag,
      },
    } satisfies HermesPlaceholderContext;
    const newContext = {
      member,
      services: {
        tag: newTag,
      },
    } satisfies HermesPlaceholderContext;

    const updateContext = {
      ...newContext,
      update: {
        affected: this.getOwnMember(),
        updater: member,
        new: newTag,
        old: oldTag,
      },
    } satisfies HermesPlaceholderContext;

    const updateEmbed = this.tagMessages.getUpdateLogEmbed(updateContext);
    const oldInfo = this.tagMessages.getInfoEmbed(oldContext);
    const newInfo = this.tagMessages.getInfoEmbed(newContext);

    await this.logChannel.send({ embeds: [updateEmbed, oldInfo, newInfo] });
  }

  public async postDeleteLog(
    member: HermesMember,
    tag: TagData,
  ): Promise<void> {
    if (!this.tagConfig.log || !this.tagConfig.log.delete) return;
    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const context = {
      member,
      services: {
        tag,
      },
      update: {
        affected: this.getOwnMember(),
        updater: member,
        new: {},
        old: tag,
      },
    } satisfies HermesPlaceholderContext;

    const deleteEmbed = this.tagMessages.getDeleteLogEmbed(context);
    const infoEmbed = this.tagMessages.getInfoEmbed(context);

    await this.logChannel.send({ embeds: [deleteEmbed, infoEmbed] });
  }

  public async postCreateLog(
    member: HermesMember,
    tag: TagData,
  ): Promise<void> {
    if (!this.tagConfig.log || !this.tagConfig.log.create) return;
    if (!this.logChannel) {
      throw new IllegalStateError(
        "Log channel not found, haven't started yet?",
      );
    }

    const context = {
      member,
      services: {
        tag,
      },
      update: {
        affected: this.getOwnMember(),
        updater: member,
        new: tag,
        old: {},
      },
    } satisfies HermesPlaceholderContext;

    const logEmbed = this.tagMessages.getCreateLogEmbed(context);
    const infoEmbed = this.tagMessages.getInfoEmbed(context);

    await this.logChannel.send({ embeds: [logEmbed, infoEmbed] });
  }
}
