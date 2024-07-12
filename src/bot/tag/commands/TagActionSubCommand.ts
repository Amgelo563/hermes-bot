import type { ParentCommand } from '@nyx-discord/core';
import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';

import type { AutocompleteChoiceSource } from '../../../autocomplete/AutocompleteChoiceSource';
import type { ConfigCommandOption } from '../../../discord/command/DiscordCommandOptionSchema';
import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { DiscordServiceAgent } from '../../../service/discord/DiscordServiceAgent';
import type {
  TagActionOptions,
  TagActionType,
} from '../../../tag/action/TagAction';
import type { TagActionsManager } from '../../../tag/action/TagActionsManager';
import type { TagRepository } from '../../../tag/database/TagRepository';
import type { DiscordTagAgent } from '../../../tag/discord/DiscordTagAgent';
import type { IdentifiableTag } from '../../../tag/identity/IdentifiableTag';
import { createIdentifiableTag } from '../../../tag/identity/IdentifiableTag';
import type { TagMessagesParser } from '../../../tag/message/TagMessagesParser';
import { AbstractActionSubCommand } from '../../action/AbstractActionSubCommand';

export class TagActionSubCommand extends AbstractActionSubCommand<
  IdentifiableTag,
  TagActionOptions,
  DiscordTagAgent
> {
  protected readonly messages: TagMessagesParser;

  protected readonly repository: TagRepository;

  protected readonly autocompleteSource: AutocompleteChoiceSource;

  constructor(
    parent: ParentCommand,
    data: CommandSchemaType,
    tagOption: ConfigCommandOption,
    messages: TagMessagesParser,
    actions: TagActionsManager,
    repository: TagRepository,
    autocompleteSource: AutocompleteChoiceSource,
    action: TagActionType,
    agent: DiscordServiceAgent,
    allowNonMembers: boolean = true,
  ) {
    super(parent, data, tagOption, actions, action, agent, allowNonMembers);

    this.messages = messages;
    this.repository = repository;
    this.autocompleteSource = autocompleteSource;
  }

  public async autocomplete(interaction: AutocompleteInteraction) {
    const options = await this.autocompleteSource.autocomplete(interaction);
    await interaction.respond(options);
  }

  protected async replyNotFound(
    context: HermesPlaceholderContext,
    interaction: ChatInputCommandInteraction,
    id: string,
  ) {
    const embed = this.messages.getNotFoundErrorEmbed(context, id);

    await interaction.editReply({ embeds: [embed] });
  }

  protected async find(id: number): Promise<IdentifiableTag | null> {
    const tag = await this.repository.find(id);
    if (!tag) {
      return null;
    }

    return createIdentifiableTag(tag);
  }
}
