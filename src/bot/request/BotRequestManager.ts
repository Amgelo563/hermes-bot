import type { NyxBot } from '@nyx-discord/core';
import type { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { Events } from 'discord.js';

import { UserAutocompleteChoiceSource } from '../../autocomplete/UserAutocompleteChoiceSource';
import { DiscordCommandLimits } from '../../discord/command/DiscordCommandLimits';
import type { TagRepository } from '../../hermes/database/TagRepository';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { RequestAction } from '../../request/action/RequestAction';
import type { RequestDomain } from '../../request/RequestDomain';
import { ServiceActionInteractionSubscriber } from '../action/ServiceActionInteractionSubscriber';
import { RequestsActionSubCommand } from './commands/RequestsActionSubCommand';
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
    requestDomain: RequestDomain,
    tagRepository: TagRepository,
  ) {
    const repository = requestDomain.getRepository();

    const emptyMessage = messages.getRequestMessages().getEmptyMessage();
    const maxLabelLength = DiscordCommandLimits.Autocomplete.Label;
    const requestAutocomplete = UserAutocompleteChoiceSource.create(
      async (interaction) => {
        const userId = interaction.user.id;
        const requests = await repository.fetchFrom(
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
          let name = `${request.title} - ${request.tag.name}`;
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
      requestDomain.getDiscordAgent(),
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
    await this.bot.events.subscribeClient(this.actionsSubscriber);
  }

  protected async setupStandaloneCommand() {
    const command = new RequestStandaloneCommand(
      this.messages,
      this.requestDomain,
      this.tagRepository,
    );

    await this.bot.commands.addCommand(command);
  }

  protected async setupParentCommand(): Promise<void> {
    const requestMessages = this.messages.getRequestMessages();
    const actions = this.requestDomain.getActions();

    const parentData = requestMessages.getParentCommandData();
    const parent = new RequestsParentCommand(parentData);

    const updateData = requestMessages.getUpdateCommandData();
    const updateSubCommand = new RequestsActionSubCommand(
      parent,
      updateData,
      updateData.options.request,
      requestMessages,
      actions,
      this.requestDomain.getRepository(),
      this.requestAutocomplete,
      RequestAction.enum.ReqUpd,
      false,
    );

    const infoData = requestMessages.getInfoCommandData();
    const infoSubCommand = new RequestsActionSubCommand(
      parent,
      infoData,
      infoData.options.request,
      requestMessages,
      actions,
      this.requestDomain.getRepository(),
      this.requestAutocomplete,
      RequestAction.enum.Info,
      true,
    );

    const repostData = requestMessages.getRepostCommandData();
    const repostSubCommand = new RequestsActionSubCommand(
      parent,
      repostData,
      repostData.options.request,
      requestMessages,
      actions,
      this.requestDomain.getRepository(),
      this.requestAutocomplete,
      RequestAction.enum.Repost,
      false,
    );

    const deleteData = requestMessages.getDeleteCommandData();
    const deleteSubCommand = new RequestsActionSubCommand(
      parent,
      deleteData,
      deleteData.options.request,
      requestMessages,
      actions,
      this.requestDomain.getRepository(),
      this.requestAutocomplete,
      RequestAction.enum.Delete,
      false,
    );

    parent.addChildren([
      updateSubCommand,
      infoSubCommand,
      repostSubCommand,
      deleteSubCommand,
    ]);

    await this.bot.commands.addCommand(parent);
  }
}
