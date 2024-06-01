import type { EventDispatchMeta, Identifiable } from '@nyx-discord/core';
import { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { Interaction } from 'discord.js';
import { Events } from 'discord.js';
import type { AbstractActionsManager } from '../../service/action/AbstractActionsManager';
import type { DiscordServiceAgent } from '../../service/discord/DiscordServiceAgent';

// eslint-disable-next-line max-len
export class ServiceActionInteractionSubscriber extends AbstractDJSClientSubscriber<Events.InteractionCreate> {
  protected readonly event = Events.InteractionCreate;

  protected readonly actions: AbstractActionsManager<
    Identifiable<string>,
    [string, ...string[]],
    unknown
  >;

  protected readonly agent: DiscordServiceAgent;

  constructor(
    actions: AbstractActionsManager<
      Identifiable<string>,
      [string, ...string[]],
      unknown
    >,
    agent: DiscordServiceAgent,
  ) {
    super();
    this.actions = actions;
    this.agent = agent;
  }

  public async handleEvent(
    meta: EventDispatchMeta,
    interaction: Interaction,
  ): Promise<void> {
    if (
      interaction.isAutocomplete()
      || interaction.isCommand()
      || !interaction.inCachedGuild()
    )
      return;

    const member = interaction.member
      ? await this.agent.fetchMember(interaction.member)
      : await this.agent.fetchMember(interaction.user.id);

    const handled = await this.actions.handleComponentInteraction(
      interaction,
      member,
    );

    if (handled) meta.setHandled();
  }
}
