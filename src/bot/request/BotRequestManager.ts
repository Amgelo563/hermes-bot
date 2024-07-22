import type { NyxBot } from '@nyx-discord/core';
import type { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { Events, GuildMember } from 'discord.js';

import { UserAutocompleteChoiceSource } from '../../autocomplete/UserAutocompleteChoiceSource';
import type { HermesConfigWrapper } from '../../config/file/HermesConfigWrapper';
import { DiscordCommandLimits } from '../../discord/command/DiscordCommandLimits';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { RequestAction } from '../../request/action/RequestAction';
import type { RequestDomain } from '../../request/RequestDomain';
import type { TagRepository } from '../../tag/database/TagRepository';
import { ServiceActionInteractionSubscriber } from '../action/events/ServiceActionInteractionSubscriber';
import { RequestActionSubCommand } from './commands/RequestActionSubCommand';
import { RequestSearchSubCommand } from './commands/RequestSearchSubCommand';
import { RequestsParentCommand } from './commands/RequestsParentCommand';
import { RequestStandaloneCommand } from './commands/RequestStandaloneCommand';

export class BotRequestManager {
  protected readonly messages: HermesMessageService;

  protected readonly requestDomain: RequestDomain;

  protected readonly requestAutocomplete: UserAutocompleteChoiceSource;

  protected readonly actionsSubscriber: AbstractDJSClientSubscriber<Events.InteractionCreate>;

  protected readonly bot: NyxBot;

  protected readonly tagRepository: TagRepository;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    requestDomain: RequestDomain,
    requestAutocomplete: UserAutocompleteChoiceSource,
    actionsSubscriber: AbstractDJSClientSubscriber<Events.InteractionCreate>,
    tagRepository: TagRepository,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.requestDomain = requestDomain;
    this.requestAutocomplete = requestAutocomplete;
    this.actionsSubscriber = actionsSubscriber;
    this.tagRepository = tagRepository;
  }

  public static create(
    bot: NyxBot,
    messages: HermesMessageService,
    config: HermesConfigWrapper,
    requestDomain: RequestDomain,
    tagRepository: TagRepository,
  ) {
    const repository = requestDomain.getRepository();

    const emptyMessage = messages.getRequestMessages().getEmptyMessage();
    const maxLabelLength = DiscordCommandLimits.Autocomplete.Label;
    const noTagsTag = messages.getTagsMessages().getNoTagsTag();

    const requestAutocomplete = UserAutocompleteChoiceSource.create(
      async (interaction) => {
        const member = interaction.member as GuildMember | null;
        const userId = interaction.user.id;
        const requests =
          member && config.isStaff(member)
            ? await repository.findAll(DiscordCommandLimits.Autocomplete.Max)
            : await repository.fetchFrom(
                userId,
                DiscordCommandLimits.Autocomplete.Max,
              );
        if (!requests.length) {
          return [
            {
              name: emptyMessage,
              value: '-1',
            },
          ];
        }

        return requests.map((request) => {
          const tag = request.tag ?? noTagsTag;

          let name = `${request.title} - ${tag.name}`;
          if (name.length > maxLabelLength) {
            name = name.slice(0, maxLabelLength - 1) + '…';
          }

          return {
            name,
            value: request.id.toString(),
          };
        });
      },
    );

    const subscriber = new ServiceActionInteractionSubscriber(
      requestDomain.getActions(),
    );

    return new BotRequestManager(
      bot,
      messages,
      requestDomain,
      requestAutocomplete,
      subscriber,
      tagRepository,
    );
  }

  public async start(): Promise<void> {
    await this.setupStandaloneCommand();
    await this.setupParentCommand();
    await this.bot.getEventManager().subscribeClient(this.actionsSubscriber);
  }

  protected async setupStandaloneCommand() {
    const command = new RequestStandaloneCommand(
      this.messages,
      this.requestDomain,
      this.tagRepository,
    );

    await this.bot.getCommandManager().addCommands(command);
  }

  protected async setupParentCommand(): Promise<void> {
    const requestMessages = this.messages.getRequestMessages();
    const actions = this.requestDomain.getActions();
    const agent = this.requestDomain.getDiscordAgent();
    const requestRepository = this.requestDomain.getRepository();

    const parentData = requestMessages.getParentCommandData();
    const parent = new RequestsParentCommand(parentData);

    const updateData = requestMessages.getUpdateCommandData();
    const updateSubCommand = new RequestActionSubCommand(
      parent,
      updateData,
      updateData.options.request,
      requestMessages,
      actions,
      requestRepository,
      this.requestAutocomplete,
      RequestAction.enum.ReqUpd,
      agent,
      false,
    );

    const infoData = requestMessages.getInfoCommandData();
    const infoSubCommand = new RequestActionSubCommand(
      parent,
      infoData,
      infoData.options.request,
      requestMessages,
      actions,
      requestRepository,
      this.requestAutocomplete,
      RequestAction.enum.Info,
      agent,
    );

    const repostData = requestMessages.getRepostCommandData();
    const repostSubCommand = new RequestActionSubCommand(
      parent,
      repostData,
      repostData.options.request,
      requestMessages,
      actions,
      requestRepository,
      this.requestAutocomplete,
      RequestAction.enum.Repost,
      agent,
      false,
    );

    const deleteData = requestMessages.getDeleteCommandData();
    const deleteSubCommand = new RequestActionSubCommand(
      parent,
      deleteData,
      deleteData.options.request,
      requestMessages,
      actions,
      requestRepository,
      this.requestAutocomplete,
      RequestAction.enum.Delete,
      agent,
    );

    const searchData = requestMessages.getSearchCommandData();
    const searchSubCommand = new RequestSearchSubCommand(
      parent,
      searchData,
      this.tagRepository,
      requestRepository,
      agent,
      this.messages,
    );

    parent.addChildren(
      updateSubCommand,
      infoSubCommand,
      repostSubCommand,
      deleteSubCommand,
      searchSubCommand,
    );

    await this.bot.getCommandManager().addCommands(parent);
  }
}
