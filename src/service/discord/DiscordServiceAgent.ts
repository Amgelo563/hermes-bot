import type { Identifiable } from '@nyx-discord/core';
import { IllegalStateError, ObjectNotFoundError } from '@nyx-discord/core';
import type {
  Client,
  ClientUser,
  EmbedBuilder,
  Guild,
  Interaction,
  TextBasedChannel,
} from 'discord.js';

import type { HermesConfig } from '../../config/HermesConfigSchema';
import type { HermesPlaceholderErrorContext } from '../../hermes/message/context/HermesPlaceholderErrorContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';

export class DiscordServiceAgent {
  protected readonly config: HermesConfig;

  protected readonly messages: HermesMessageService;

  protected readonly client: Client;

  protected errorChannel: TextBasedChannel | null = null;

  protected guild: Guild | null = null;

  constructor(
    client: Client,
    config: HermesConfig,
    messages: HermesMessageService,
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
    return new DiscordServiceAgent(client, config, messages);
  }

  public start() {
    const guild = this.client.guilds.cache.get(this.config.discord.server);
    if (!guild) {
      throw new ObjectNotFoundError(
        'Guild not found: ' + this.config.discord.server,
      );
    }
    this.guild = guild;

    const errorChannel = guild.channels.cache.get(
      this.config.discord.errorLogChannel,
    );
    if (!errorChannel) {
      throw new ObjectNotFoundError(
        'Channel not found: ' + this.config.discord.errorLogChannel,
      );
    }
    if (!errorChannel.isTextBased()) {
      throw new Error(
        'Channel is not text: ' + this.config.discord.errorLogChannel,
      );
    }
    this.errorChannel = errorChannel;
  }

  public async postGenericError(error: Error, id: string): Promise<void> {
    const context: HermesPlaceholderErrorContext = {
      user: this.client.user as ClientUser,
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
      user: this.client.user as ClientUser,
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

  public getGuild(): Guild {
    if (!this.guild) {
      throw new IllegalStateError('Guild not found, has the agent started?');
    }

    return this.guild;
  }
}
