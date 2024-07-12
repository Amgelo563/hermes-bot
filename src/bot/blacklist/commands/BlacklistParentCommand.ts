import type { SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { SlashCommandBuilder } from '@discordjs/builders';
import { AbstractParentCommand } from '@nyx-discord/framework';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';

export class BlacklistParentCommand extends AbstractParentCommand {
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
