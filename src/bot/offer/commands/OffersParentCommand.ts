import type { ParentCommandData } from '@nyx-discord/core';
import { AbstractParentCommand } from '@nyx-discord/framework';

export class OffersParentCommand extends AbstractParentCommand {
  protected readonly data: ParentCommandData;

  protected readonly children = [];

  constructor(data: ParentCommandData) {
    super();
    this.data = data;
  }
}
