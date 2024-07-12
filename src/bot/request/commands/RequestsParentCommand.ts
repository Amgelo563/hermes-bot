import { AbstractParentCommand } from '@nyx-discord/framework';
import type { SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';

export class RequestsParentCommand extends AbstractParentCommand {
  protected readonly data: CommandSchemaType;

  constructor(data: CommandSchemaType) {
    super();
    this.data = data;
  }

  protected createData(): SlashCommandSubcommandsOnlyBuilder {
    return new SlashCommandBuilder()
      .setName(this.data.name)
      .setDescription(this.data.description)
      .setDMPermission(false);
  }
}
