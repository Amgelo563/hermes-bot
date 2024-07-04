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
  OfferActionOptions,
  OfferActionType,
} from '../../../offer/action/OfferAction';
import type { OfferActionsManager } from '../../../offer/action/OfferActionsManager';
import type { OfferRepository } from '../../../offer/database/OfferRepository';
import type { DiscordOfferAgent } from '../../../offer/discord/DiscordOfferAgent';
import type { IdentifiableOffer } from '../../../offer/identity/IdentifiableOffer';
import { createIdentifiableOffer } from '../../../offer/identity/IdentifiableOffer';
import type { OfferMessagesParser } from '../../../offer/message/read/OfferMessagesParser';
import { AbstractActionSubCommand } from '../../action/AbstractActionSubCommand';

export class OfferActionSubCommand extends AbstractActionSubCommand<
  IdentifiableOffer,
  OfferActionOptions,
  DiscordOfferAgent
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
    agent: DiscordOfferAgent,
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
    if (!this.allowNonMembers && !interaction.inGuild()) return [];

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
