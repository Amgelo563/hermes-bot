import type { Client, Guild, Message, TextBasedChannel } from 'discord.js';

import type { DiscordConfig } from '../../config/configs/discord/DiscordConfigSchema';
import type { HermesConfig } from '../../config/file/HermesConfigSchema';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { DiscordServiceAgent } from '../../service/discord/DiscordServiceAgent';
import type { HermesMember } from '../../service/member/HermesMember';
import type { BlacklistConfig } from '../config/BlacklistConfigSchema';
import type { BlacklistData } from '../data/BlacklistData';
import type { BlacklistMessagesParser } from '../message/read/BlacklistMessagesParser';

export class DiscordBlacklistAgent extends DiscordServiceAgent {
  protected readonly blacklistMessages: BlacklistMessagesParser;

  protected readonly blacklistConfig: BlacklistConfig;

  protected readonly discordConfig: DiscordConfig;

  protected logChannel: TextBasedChannel | null = null;

  constructor(
    client: Client,
    discordConfig: DiscordConfig,
    messages: HermesMessageService,
    blacklistConfig: BlacklistConfig,
  ) {
    super(client, messages, discordConfig);

    this.blacklistConfig = blacklistConfig;
    this.discordConfig = discordConfig;
    this.blacklistMessages = messages.getBlacklistMessages();
  }

  public static create(
    client: Client,
    messages: HermesMessageService,
    config: HermesConfig,
  ): DiscordBlacklistAgent {
    return new DiscordBlacklistAgent(
      client,
      config.discord,
      messages,
      config.blacklist,
    );
  }

  public start() {
    super.start();
    if (!this.blacklistConfig.log) return;

    const guild = this.guild as Guild;
    const logChannel = guild.channels.cache.get(
      this.blacklistConfig.log.channel,
    );
    this.assertTextChannel('Blacklist Log', logChannel);

    this.logChannel = logChannel;
  }

  public async logBlacklistCreate(
    blacklister: HermesMember,
    blacklisted: HermesMember,
    data: BlacklistData,
  ): Promise<Message | null> {
    if (!this.blacklistConfig.log || !this.blacklistConfig.log.create) {
      return null;
    }

    this.assertTextChannel('Blacklist Log', this.logChannel);

    const context = {
      member: blacklister,
      blacklist: {
        ...data,
        blacklister,
        blacklisted,
      },
    };

    const logEmbed = this.blacklistMessages.getCreateLogEmbed(context);
    const infoEmbed = this.blacklistMessages.getInfoEmbed(context);
    return await this.logChannel.send({ embeds: [logEmbed, infoEmbed] });
  }

  public async logBlacklistDelete(
    blacklister: HermesMember,
    blacklisted: HermesMember,
    data: BlacklistData,
  ): Promise<Message | null> {
    if (!this.blacklistConfig.log || !this.blacklistConfig.log.delete) {
      return null;
    }

    this.assertTextChannel('Blacklist Log', this.logChannel);

    const context = {
      member: blacklister,
      blacklist: {
        ...data,
        blacklister,
        blacklisted,
      },
    };

    const logEmbed = this.blacklistMessages.getDeleteLogEmbed(context);
    const infoEmbed = this.blacklistMessages.getInfoEmbed(context);
    return await this.logChannel.send({ embeds: [logEmbed, infoEmbed] });
  }

  public async logBlacklistExpire(
    bot: HermesMember,
    data: BlacklistData,
  ): Promise<Message | null> {
    if (!this.blacklistConfig.log) {
      return null;
    }

    this.assertTextChannel('Blacklist Log', this.logChannel);

    const blacklister =
      (await this.fetchMember(data.createdBy))
      ?? this.getUnknownMember(data.createdBy);
    const blacklisted =
      (await this.fetchMember(data.id))
      ?? this.getUnknownMember(data.createdBy);

    const context = {
      member: bot,
      blacklist: {
        ...data,
        blacklister,
        blacklisted,
      },
    };

    const logEmbed = this.blacklistMessages.getExpireLogEmbed(context);
    const infoEmbed = this.blacklistMessages.getInfoEmbed(context);
    return await this.logChannel.send({ embeds: [logEmbed, infoEmbed] });
  }
}
