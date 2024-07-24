import { AssertionError, ObjectNotFoundError } from '@nyx-discord/core';
import type {
  Client,
  Message,
  MessageCreateOptions,
  MessageEditOptions,
  TextBasedChannel,
} from 'discord.js';

import type { HermesConfig } from '../../config/file/HermesConfigSchema';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { DiscordServiceAgent } from '../../service/discord/DiscordServiceAgent';
import type { StickyMessageCreateData } from '../data/StickyMessageCreateData';
import type { StickyMessageData } from '../data/StickyMessageData';

export class StickyMessagesDiscordAgent extends DiscordServiceAgent {
  public static create(
    client: Client,
    messages: HermesMessageService,
    config: HermesConfig,
  ) {
    return new StickyMessagesDiscordAgent(client, messages, config.discord);
  }

  public async updateSticky(
    old: StickyMessageData | null,
    newData: StickyMessageCreateData,
    messageOptions: MessageCreateOptions,
  ): Promise<Message | null> {
    if (old) {
      // Just in case guild changed
      const oldGuild = this.client.guilds.cache.get(old.guildId);
      const oldChannel = oldGuild?.channels.cache.get(old.channelId);
      if (oldChannel && oldChannel.isTextBased()) {
        if (oldChannel.lastMessageId === old.messageId) {
          await oldChannel.messages.edit(
            old.messageId,
            messageOptions as MessageEditOptions,
          );

          return null;
        }

        // Delete old one
        await oldChannel.messages.delete(old.messageId).catch((_e) => {});
      }
    }

    const channel = this.findChannel(newData.channelId);
    return channel.send(messageOptions);
  }

  protected findChannel(channelId: string): TextBasedChannel {
    const guild = this.getGuild();
    const channel = guild.channels.cache.get(channelId);

    if (!channel) {
      throw new ObjectNotFoundError(`Channel ${channelId} not found.`);
    }

    if (!channel.isTextBased()) {
      throw new AssertionError(`Channel ${channelId} is not a text channel.`);
    }

    return channel;
  }
}
