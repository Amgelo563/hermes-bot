import type {
  ParentCommandData,
  SubCommand,
  SubCommandGroup,
} from '@nyx-discord/core';
import { AbstractParentCommand } from '@nyx-discord/framework';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';

export class BlacklistParentCommand extends AbstractParentCommand {
  protected readonly data: ParentCommandData;

  protected readonly children: (SubCommand | SubCommandGroup)[] = [];

  constructor(data: CommandSchemaType) {
    super();
    this.data = data;
  }
}
