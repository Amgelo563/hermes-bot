import type { Identifiable } from '@nyx-discord/core';
import {
  AssertionError,
  IllegalStateError,
  ObjectNotFoundError,
} from '@nyx-discord/core';
import type {
  Channel,
  Client,
  EmbedBuilder,
  Guild,
  GuildBasedChannel,
  GuildMember,
  Interaction,
  Message,
  TextBasedChannel,
  User,
} from 'discord.js';
import { DiscordAPIError, PermissionsBitField } from 'discord.js';
import type { DiscordConfig } from '../../config/configs/discord/DiscordConfigSchema';
import type { HermesConfig } from '../../config/file/HermesConfigSchema';
import { DiscordCommandLimits } from '../../discord/command/DiscordCommandLimits';
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
      throw new ObjectNotFoundError(`Guild not found: ${this.config.server}`);
    }
    this.guild = guild;

    const errorChannel = guild.channels.cache.get(this.config.errorLogChannel);
    this.assertTextChannel('Error', errorChannel);

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
    this.assertTextChannel('Error', this.errorChannel);
    await this.errorChannel.send({ embeds: [embed] });
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
          name: `❌ Error (ID: ${id})`.slice(
            0,
            DiscordCommandLimits.Autocomplete.Label,
          ),
          value: 'error',
        },
      ]);
      return;
    }

    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const member = await this.fetchMemberFromInteraction(interaction);
    const context: HermesPlaceholderErrorContext = {
      member,
      error: {
        instance: error,
        id,
      },
    };

    const errorEmbeds = this.messages
      .getGeneralMessages()
      .getUnknownErrorEmbeds(context);

    await this.postErrorEmbed(errorEmbeds.log);
    await interaction
      .editReply({ embeds: [errorEmbeds.user], components: [] })
      .catch((_e) => {});
  }

  public async fetchMemberFromInteraction(
    interaction: Interaction,
  ): Promise<HermesMember> {
    const member = interaction.member;
    return member
      ? await this.fetchMember(member as GuildMember, true)
      : await this.fetchMember(interaction.user.id, true);
  }

  public async fetchMember(
    idOrMember: string | GuildMember,
    force?: false,
  ): Promise<HermesMember | null>;

  public async fetchMember(
    idOrMember: string | GuildMember,
    force: true,
  ): Promise<HermesMember>;

  public async fetchMember(
    idOrMember: string | GuildMember,
    force: boolean = true,
  ): Promise<HermesMember | null> {
    if (!this.guild) {
      throw new IllegalStateError('Guild not found, has the agent started?');
    }

    try {
      const guildMember =
        typeof idOrMember === 'string'
          ? await this.guild.members.fetch({ user: idOrMember, force: true })
          : idOrMember;
      return {
        ...guildMember.user,
        avatar: guildMember.displayAvatarURL(),
        tag: guildMember.user.tag,
        roles: guildMember.roles.cache.map((role) => role.id),
        roleNames: guildMember.roles.cache.map((role) => role.name),
        type: HermesMemberTypeEnum.Real,
      };
    } catch (e) {
      if (e instanceof DiscordAPIError) {
        const user = await this.client.users.fetch(idOrMember);
        return this.mockMember(user);
      }

      if (force) {
        throw e;
      }
      return null;
    }
  }

  public async fetchMemberOrUnknown(
    idOrMember: string | GuildMember,
  ): Promise<HermesMember> {
    const member = await this.fetchMember(idOrMember);
    return member ?? this.getUnknownMember(idOrMember as string);
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
      roleNames: [],
      type: HermesMemberTypeEnum.Mock,
    };
  }

  public getUnknownMember(id: string): HermesMember {
    return this.messages.getGeneralMessages().getUnknownMember(id);
  }

  public postError(embed: EmbedBuilder): Promise<Message> {
    this.assertTextChannel('Error', this.errorChannel);

    return this.errorChannel.send({ embeds: [embed] });
  }

  public getGuild(): Guild {
    if (!this.guild) {
      throw new IllegalStateError('Guild not found, has the agent started?');
    }

    return this.guild;
  }

  protected assertTextChannel(
    name: string,
    channel: Channel | null | undefined,
    assertAdministrator: boolean = false,
  ): asserts channel is GuildBasedChannel & TextBasedChannel {
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    if (!channel) {
      throw new IllegalStateError(
        `Specified ${capitalizedName} channel not found.`,
      );
    }

    if (!channel.isTextBased()) {
      throw new AssertionError(
        `${capitalizedName} channel is not a text channel. Type is: ${channel.type}.`,
      );
    }

    if (channel.isDMBased()) {
      return;
    }

    const me = channel.guild.members.me;
    if (!me) {
      throw new IllegalStateError(
        'Client user not found, has the client started?',
      );
    }
    const permissions = channel.permissionsFor(me);
    const adminPermissions =
      PermissionsBitField.Flags.ManageMessages
      | PermissionsBitField.Flags.ReadMessageHistory;

    if (
      !permissions.has(PermissionsBitField.Flags.SendMessages)
      || !permissions.has(PermissionsBitField.Flags.ViewChannel)
      || (assertAdministrator && !permissions.has(adminPermissions))
    ) {
      throw new AssertionError(
        `Bot cannot send messages in ${capitalizedName} channel (${channel.id}): Missing either \`SendMessages\` or \`ViewChannel\` permission.`,
      );
    }
  }
}
