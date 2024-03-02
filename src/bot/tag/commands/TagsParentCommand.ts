import type { ParentCommandData, SubCommand } from '@nyx-discord/core';
import { AbstractParentCommand } from '@nyx-discord/framework';

export class TagsParentCommand extends AbstractParentCommand {
  protected readonly data: ParentCommandData = {
    name: 'tags',
    description: 'Manage tags',
  };

  protected children: SubCommand[] = [];

  constructor(data: ParentCommandData) {
    super();

    this.data = data;
  }
}
