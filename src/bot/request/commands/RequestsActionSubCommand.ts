import type { ParentCommand, SubCommandData } from '@nyx-discord/core';
import type {
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';

import type { AutocompleteChoiceSource } from '../../../autocomplete/AutocompleteChoiceSource';
import type { RequestRepository } from '../../../hermes/database/RequestRepository';
import type { ConfigCommandOption } from '../../../hermes/message/command/ConfigCommandOptionSchema';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { IdentifiableRequest } from '../../../request/action/identity/IdentifiableRequest';
import { createIdentifiableRequest } from '../../../request/action/identity/IdentifiableRequest';
import type {
  RequestActionOptions,
  RequestActionType,
} from '../../../request/action/RequestAction';
import type { RequestActionsManager } from '../../../request/action/RequestActionsManager';
import type { RequestMessagesParser } from '../../../request/message/RequestMessagesParser';
import { AbstractActionSubCommand } from '../../action/AbstractActionSubCommand';

export class RequestsActionSubCommand extends AbstractActionSubCommand<
  IdentifiableRequest,
  RequestActionOptions
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
  ) {
    super(parent, data, tagOption, actions, action);

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
