import type { ParentCommand, SubCommandData } from '@nyx-discord/core';
import type {
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';

import type { AutocompleteChoiceSource } from '../../../autocomplete/AutocompleteChoiceSource';
import type { OfferRepository } from '../../../hermes/database/OfferRepository';
import type { ConfigCommandOption } from '../../../hermes/message/command/ConfigCommandOptionSchema';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { IdentifiableOffer } from '../../../offer/action/identity/IdentifiableOffer';
import { createIdentifiableOffer } from '../../../offer/action/identity/IdentifiableOffer';
import type {
  OfferActionOptions,
  OfferActionType,
} from '../../../offer/action/OfferAction';
import type { OfferActionsManager } from '../../../offer/action/OfferActionsManager';
import type { OfferMessagesParser } from '../../../offer/message/OfferMessagesParser';
import { AbstractActionSubCommand } from '../../action/AbstractActionSubCommand';

export class OffersActionSubCommand extends AbstractActionSubCommand<
  IdentifiableOffer,
  OfferActionOptions
> {
  protected readonly messages: OfferMessagesParser;

  protected readonly repository: OfferRepository;

  protected readonly autocompleteSource: AutocompleteChoiceSource;

  constructor(
    parent: ParentCommand,
    data: SubCommandData,
    tagOption: ConfigCommandOption,
    messages: OfferMessagesParser,
    actions: OfferActionsManager,
    repository: OfferRepository,
    autocompleteSource: AutocompleteChoiceSource,
    action: OfferActionType,
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

  protected async find(id: number): Promise<IdentifiableOffer | null> {
    const offer = await this.repository.find(id);
    if (!offer) {
      return null;
    }

    return createIdentifiableOffer(offer);
  }
}
