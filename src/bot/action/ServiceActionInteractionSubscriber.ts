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
    Identifiable<string> & { id: unknown },
    [string, ...string[]],
    DiscordServiceAgent,
    unknown
  >;

  constructor(
    actions: AbstractActionsManager<
      Identifiable<string> & { id: unknown },
      [string, ...string[]],
      DiscordServiceAgent,
      unknown
    >,
  ) {
    super();
    this.actions = actions;
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

    const handled = await this.actions.handleComponentInteraction(interaction);

    if (handled) meta.setHandled();
  }
}
