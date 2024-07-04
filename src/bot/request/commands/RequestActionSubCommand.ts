import type { ParentCommand, SubCommandData } from '@nyx-discord/core';
import type {
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';

import type { AutocompleteChoiceSource } from '../../../autocomplete/AutocompleteChoiceSource';
import type { ConfigCommandOption } from '../../../discord/command/DiscordCommandOptionSchema';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type {
  RequestActionOptions,
  RequestActionType,
} from '../../../request/action/RequestAction';
import type { RequestActionsManager } from '../../../request/action/RequestActionsManager';
import type { RequestRepository } from '../../../request/database/RequestRepository';
import type { DiscordRequestAgent } from '../../../request/discord/DiscordRequestAgent';
import type { IdentifiableRequest } from '../../../request/identity/IdentifiableRequest';
import { createIdentifiableRequest } from '../../../request/identity/IdentifiableRequest';
import type { RequestMessagesParser } from '../../../request/message/read/RequestMessagesParser';
import { AbstractActionSubCommand } from '../../action/AbstractActionSubCommand';

export class RequestActionSubCommand extends AbstractActionSubCommand<
  IdentifiableRequest,
  RequestActionOptions,
  DiscordRequestAgent
> {
  protected readonly messages: RequestMessagesParser;

  protected readonly repository: RequestRepository;

  protected readonly autocompleteSource: AutocompleteChoiceSource;

  constructor(
    parent: ParentCommand,
    data: SubCommandData,
    tagOption: ConfigCommandOption,
    messages: RequestMessagesParser,
    actions: RequestActionsManager,
    repository: RequestRepository,
    autocompleteSource: AutocompleteChoiceSource,
    action: RequestActionType,
    agent: DiscordRequestAgent,
    allowNonMembers: boolean = true,
  ) {
    super(parent, data, tagOption, actions, action, agent, allowNonMembers);

    this.messages = messages;
    this.repository = repository;
    this.autocompleteSource = autocompleteSource;
  }

  public autocomplete(
    _option: AutocompleteFocusedOption,
    interaction: AutocompleteInteraction,
  ) {
    return this.autocompleteSource.autocomplete(interaction);
  }

  protected async replyNotFound(
    context: HermesPlaceholderContext,
    interaction: ChatInputCommandInteraction,
    id: string,
  ) {
    const embed = this.messages.getNotFoundErrorEmbed(context, id);

    await interaction.editReply({ embeds: [embed] });
  }

  protected async find(id: number): Promise<IdentifiableRequest | null> {
    const request = await this.repository.find(id);
    if (!request) {
      return null;
    }

    return createIdentifiableRequest(request);
  }
}
