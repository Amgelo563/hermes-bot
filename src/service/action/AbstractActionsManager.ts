import type { Identifiable } from '@nyx-discord/core';
import { ObjectNotFoundError } from '@nyx-discord/core';
import type {
  AnySelectMenuInteraction,
  ButtonInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import type { HermesMember } from '../member/HermesMember';

import type { ServiceActionsCustomIdCodec } from './codec/ServiceActionsCustomIdCodec';
import type { ServiceActionCustomIdBuilder } from './customId/ServiceActionCustomIdBuilder';
import type { ServiceActionExecutor } from './executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from './interaction/ServiceActionInteraction';

export abstract class AbstractActionsManager<
  Data extends Identifiable<string>,
  Actions extends [string, ...string[]],
  CreateData,
> {
  protected readonly codec: ServiceActionsCustomIdCodec<Data, Actions>;

  protected readonly executors: Map<
    Actions[number],
    ServiceActionExecutor<Data>
  >;

  protected readonly createExecutor: ServiceActionExecutor<CreateData>;

  protected readonly missingExecutor: ServiceActionExecutor<string>;

  constructor(
    codec: ServiceActionsCustomIdCodec<Data, Actions>,
    executors: Map<Actions[number], ServiceActionExecutor<Data>>,
    createExecutor: ServiceActionExecutor<CreateData>,
    missingExecutor: ServiceActionExecutor<string>,
  ) {
    this.codec = codec;
    this.executors = executors;
    this.createExecutor = createExecutor;
    this.missingExecutor = missingExecutor;
  }

  public async create(
    interaction: ServiceActionInteraction,
    member: HermesMember,
    data: CreateData,
  ) {
    await this.createExecutor.execute(interaction, member, data);
  }

  public async handleComponentInteraction(
    interaction:
      | AnySelectMenuInteraction
      | ButtonInteraction
      | ModalSubmitInteraction,
    member: HermesMember,
  ): Promise<boolean> {
    const customId = this.extractCustomId(interaction);
    if (!customId) return false;

    const builder = this.createBuilderFromCustomId(customId);
    if (!builder) {
      return false;
    }

    const id = builder.getObjectId();
    const numberId = Number.parseInt(id);

    if (Number.isNaN(numberId)) {
      return false;
    }

    const data = await this.fetch(numberId);
    if (!data) {
      await this.missingExecutor.execute(interaction, member, id);
      return true;
    }

    const action = builder.getAction();
    const executor = this.executors.get(action);

    if (!executor) {
      throw new ObjectNotFoundError(
        `Executor for action "${action}" not found`,
      );
    }

    await executor.execute(interaction, member, data);

    return true;
  }

  public async executeAction(
    action: Actions[number],
    interaction: ServiceActionInteraction,
    data: Data,
    member: HermesMember,
  ): Promise<void> {
    const executor = this.executors.get(action);

    if (!executor) {
      throw new ObjectNotFoundError(
        `Executor for action "${action}" not found`,
      );
    }

    return executor.execute(interaction, member, data);
  }

  public setExecutor(
    action: Actions[number],
    executor: ServiceActionExecutor<Data>,
  ): void {
    this.executors.set(action, executor);
  }

  public getCodec(): ServiceActionsCustomIdCodec<Data, Actions> {
    return this.codec;
  }

  public getExecutors(): Map<Actions[number], ServiceActionExecutor<Data>> {
    return this.executors;
  }

  protected extractCustomId(
    interaction: MessageComponentInteraction | ModalSubmitInteraction,
  ): string | null {
    if (interaction.isStringSelectMenu()) {
      if (interaction.values.length !== 1) return null;

      return interaction.values[0];
    }

    return interaction.customId;
  }

  protected abstract createBuilderFromCustomId(
    customId: string,
  ): ServiceActionCustomIdBuilder<Actions> | null;

  protected abstract fetch(id: number): Promise<Data | null>;
}
