import type { Identifiable } from '@nyx-discord/core';
import { ObjectNotFoundError } from '@nyx-discord/core';
import type {
  AnySelectMenuInteraction,
  ButtonInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from 'discord.js';

import type { DiscordServiceAgent } from '../discord/DiscordServiceAgent';
import type { ServiceActionsCustomIdCodec } from './codec/ServiceActionsCustomIdCodec';
import type { ServiceActionCustomIdBuilder } from './customId/ServiceActionCustomIdBuilder';
import type { ServiceActionExecutor } from './executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from './interaction/ServiceActionInteraction';

export abstract class AbstractActionsManager<
  Data extends Identifiable<string> & { id: unknown },
  Actions extends [string, ...string[]],
  Agent extends DiscordServiceAgent,
  CreateData,
> {
  protected readonly codec: ServiceActionsCustomIdCodec<Data, Actions>;

  protected readonly executors: Map<
    Actions[number],
    ServiceActionExecutor<Agent, Data>
  >;

  protected readonly createExecutor: ServiceActionExecutor<Agent, CreateData>;

  protected readonly missingExecutor: ServiceActionExecutor<Agent, string>;

  protected readonly agent: Agent;

  constructor(
    codec: ServiceActionsCustomIdCodec<Data, Actions>,
    executors: Map<Actions[number], ServiceActionExecutor<Agent, Data>>,
    createExecutor: ServiceActionExecutor<Agent, CreateData>,
    missingExecutor: ServiceActionExecutor<Agent, string>,
    agent: Agent,
  ) {
    this.codec = codec;
    this.executors = executors;
    this.createExecutor = createExecutor;
    this.missingExecutor = missingExecutor;
    this.agent = agent;
  }

  public async create(interaction: ServiceActionInteraction, data: CreateData) {
    await this.createExecutor.execute(interaction, this.agent, data);
  }

  public async handleComponentInteraction(
    interaction:
      | AnySelectMenuInteraction
      | ButtonInteraction
      | ModalSubmitInteraction,
  ): Promise<boolean> {
    const customId = this.extractCustomId(interaction);
    if (!customId) return false;

    const builder = this.createBuilderFromCustomId(customId);
    if (!builder) {
      return false;
    }

    const stringId = builder.getObjectId();
    const id = this.parseId(stringId);
    if (!id) {
      return false;
    }

    const data = await this.fetch(id);
    if (!data) {
      await this.missingExecutor.execute(interaction, this.agent, stringId);
      return true;
    }

    const action = builder.getAction();
    const executor = this.executors.get(action);

    if (!executor) {
      throw new ObjectNotFoundError(
        `Executor for action "${action}" not found`,
      );
    }

    await executor.execute(interaction, this.agent, data);

    return true;
  }

  public async executeAction(
    action: Actions[number],
    interaction: ServiceActionInteraction,
    data: Data,
  ): Promise<void> {
    const executor = this.executors.get(action);

    if (!executor) {
      throw new ObjectNotFoundError(
        `Executor for action "${action}" not found`,
      );
    }

    return executor.execute(interaction, this.agent, data);
  }

  public async executeNotFound(
    interaction: ServiceActionInteraction,
    id: string,
  ): Promise<void> {
    return this.missingExecutor.execute(interaction, this.agent, id);
  }

  public setExecutor(
    action: Actions[number],
    executor: ServiceActionExecutor<Agent, Data>,
  ): void {
    this.executors.set(action, executor);
  }

  public getCodec(): ServiceActionsCustomIdCodec<Data, Actions> {
    return this.codec;
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

  protected parseId(id: string): Data['id'] | null {
    const numberId = Number.parseInt(id);

    if (Number.isNaN(numberId)) {
      return null;
    }
  }

  protected abstract createBuilderFromCustomId(
    customId: string,
  ): ServiceActionCustomIdBuilder<Actions> | null;

  protected abstract fetch(id: Data['id']): Promise<Data | null>;
}
