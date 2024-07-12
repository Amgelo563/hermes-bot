import type { Identifiable, ParentCommand } from '@nyx-discord/core';
import { AbstractSubCommand } from '@nyx-discord/framework';
import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { SlashCommandSubcommandBuilder } from 'discord.js';

import type { ConfigCommandOption } from '../../discord/command/DiscordCommandOptionSchema';
import type { CommandSchemaType } from '../../discord/command/DiscordCommandSchema';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { AbstractActionsManager } from '../../service/action/AbstractActionsManager';
import type { DiscordServiceAgent } from '../../service/discord/DiscordServiceAgent';

export abstract class AbstractActionSubCommand<
  Data extends Identifiable<string> & { id: unknown },
  Actions extends [string, ...string[]],
  Agent extends DiscordServiceAgent,
> extends AbstractSubCommand {
  protected readonly actionsManager: AbstractActionsManager<
    Data,
    Actions,
    Agent,
    any
  >;

  protected readonly data: CommandSchemaType<'option'>;

  protected readonly optionId: string;

  protected readonly action: Actions[number];

  protected readonly agent: DiscordServiceAgent;

  protected readonly allowNonMembers: boolean;

  constructor(
    parent: ParentCommand,
    data: CommandSchemaType,
    option: ConfigCommandOption,
    actionsManager: AbstractActionsManager<Data, Actions, Agent, any>,
    action: Actions[number],
    agent: DiscordServiceAgent,
    allowNonMembers: boolean = true,
  ) {
    super(parent);
    this.data = {
      ...data,
      options: {
        option,
      },
    };
    this.optionId = option.name;
    this.actionsManager = actionsManager;
    this.action = action;
    this.agent = agent;
    this.allowNonMembers = allowNonMembers;
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const stringId = interaction.options.getString(this.optionId, true);
    const id = parseInt(stringId, 10);

    await interaction.deferReply({ ephemeral: true });
    const member = await this.agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
    };

    if (isNaN(id)) {
      await this.replyNotFound(context, interaction, stringId);
      return;
    }

    let data: Data | undefined;

    try {
      data = (await this.find(id)) ?? undefined;
    } catch (e) {
      await this.replyNotFound(context, interaction, stringId);
      return;
    }

    if (!data) {
      await this.replyNotFound(context, interaction, stringId);
      return;
    }

    await this.actionsManager.executeAction(this.action, interaction, data);
  }

  public abstract autocomplete(
    _interaction: AutocompleteInteraction,
  ): Promise<void>;

  public allowsNonMembers(): boolean {
    return this.allowNonMembers;
  }

  public createData(): SlashCommandSubcommandBuilder {
    const { option } = this.data.options;

    return new SlashCommandSubcommandBuilder()
      .setName(this.data.name)
      .setDescription(this.data.description)
      .addStringOption((builder) =>
        builder
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(true)
          .setAutocomplete(true),
      );
  }

  protected abstract replyNotFound(
    context: HermesPlaceholderContext,
    interaction: ChatInputCommandInteraction,
    id: string,
  ): Promise<void>;

  protected abstract find(id: Data['id']): Promise<Data | null>;
}
