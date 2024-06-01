import type { Identifiable } from '@nyx-discord/core';
import { IllegalStateError, ObjectNotFoundError } from '@nyx-discord/core';
import type {
  Client,
  EmbedBuilder,
  Guild,
  GuildMember,
  Interaction,
  TextBasedChannel,
  User,
} from 'discord.js';
import { DiscordAPIError } from 'discord.js';
import type { DiscordConfig } from '../../config/discord/DiscordConfigSchema';

import type { HermesConfig } from '../../config/HermesConfigSchema';
import type { HermesPlaceholderErrorContext } from '../../hermes/message/context/HermesPlaceholderErrorContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import type { HermesMember } from '../member/HermesMember';
import { HermesMemberTypeEnum } from '../member/HermesMemberType';

export class DiscordServiceAgent {
  protected readonly config: DiscordConfig;

  protected readonly messages: HermesMessageService;

  protected readonly client: Client;

  protected errorChannel: TextBasedChannel | null = null;

  protected guild: Guild | null = null;

  constructor(
    client: Client,
    messages: HermesMessageService,
    config: DiscordConfig,
  ) {
    this.client = client;
    this.config = config;
    this.messages = messages;
  }

  public static create(
    client: Client,
    messages: HermesMessageService,
    config: HermesConfig,
  ) {
    return new DiscordServiceAgent(client, messages, config.discord);
  }

  public start() {
    const guild = this.client.guilds.cache.get(this.config.server);
    if (!guild) {
      throw new ObjectNotFoundError('Guild not found: ' + this.config.server);
    }
    this.guild = guild;

    const errorChannel = guild.channels.cache.get(this.config.errorLogChannel);
    if (!errorChannel) {
      throw new ObjectNotFoundError(
        'Channel not found: ' + this.config.errorLogChannel,
      );
    }
    if (!errorChannel.isTextBased()) {
      throw new Error('Channel is not text: ' + this.config.errorLogChannel);
    }
    this.errorChannel = errorChannel;
  }

  public async postGenericError(error: Error, id: string): Promise<void> {
    const context: HermesPlaceholderErrorContext = {
      member: this.getOwnMember(),
      error: {
        instance: error,
        id,
      },
    };

    const logEmbed = this.messages
      .getGeneralMessages()
      .getUnknownErrorEmbeds(context).log;

    await this.postErrorEmbed(logEmbed);
  }

  public async postErrorEmbed(embed: EmbedBuilder): Promise<void> {
    const channel = this.errorChannel;

    if (!channel) {
      throw new IllegalStateError(
        'Error channel not found, has the agent started?',
      );
    }

    await channel.send({ embeds: [embed] });
  }

  public async handleError(
    interaction: Interaction,
    error: Error,
    meta: Identifiable,
  ): Promise<void> {
    const id = String(meta.getId());
    if (interaction.isAutocomplete()) {
      await interaction.respond([
        {
          name: `❌ Error (ID: ${id})`,
          value: 'error',
        },
      ]);
      return;
    }

    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const context: HermesPlaceholderErrorContext = {
      member: this.getOwnMember(),
      error: {
        instance: error,
        id,
      },
    };

    const errorEmbeds = this.messages
      .getGeneralMessages()
      .getUnknownErrorEmbeds(context);

    await this.postErrorEmbed(errorEmbeds.log);
    await interaction.editReply({ embeds: [errorEmbeds.user], components: [] });
  }

  public async fetchMember(
    idOrMember: string | GuildMember,
  ): Promise<HermesMember> {
    if (!this.guild) {
      throw new IllegalStateError('Guild not found, has the agent started?');
    }

    try {
      const guildMember =
        typeof idOrMember === 'string'
          ? await this.guild.members.fetch(idOrMember)
          : idOrMember;
      return {
        ...guildMember.user,
        avatar: guildMember.displayAvatarURL(),
        tag: guildMember.user.tag,
        roles: guildMember.roles.cache.map((role) => role.id),
        type: HermesMemberTypeEnum.Real,
      };
    } catch (e) {
      if (e instanceof DiscordAPIError) {
        const user = await this.client.users.fetch(idOrMember);
        return this.mockMember(user);
      }

      return this.messages
        .getGeneralMessages()
        .getUnknownMember(idOrMember as string);
    }
  }

  public getOwnMember(): HermesMember {
    const me = this.client.user;
    if (!me) {
      throw new IllegalStateError(
        'Client user not found, has the agent started?',
      );
    }
    return this.mockMember(me);
  }

  public mockMember(user: User): HermesMember {
    return {
      ...user,
      avatar: user.displayAvatarURL(),
      tag: user.tag,
      roles: [],
      type: HermesMemberTypeEnum.Mock,
    };
  }

  public getGuild(): Guild {
    if (!this.guild) {
      throw new IllegalStateError('Guild not found, has the agent started?');
    }

    return this.guild;
  }
}
