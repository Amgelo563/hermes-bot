import type { NyxBot } from '@nyx-discord/core';
import type { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { Events } from 'discord.js';

import { UserAutocompleteChoiceSource } from '../../autocomplete/UserAutocompleteChoiceSource';
import { DiscordCommandLimits } from '../../discord/command/DiscordCommandLimits';
import type { TagRepository } from '../../hermes/database/TagRepository';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { OfferAction } from '../../offer/action/OfferAction';
import type { OfferDomain } from '../../offer/OfferDomain';
import { ServiceActionInteractionSubscriber } from '../action/ServiceActionInteractionSubscriber';
import { OffersActionSubCommand } from './commands/OffersActionSubCommand';
import { OffersParentCommand } from './commands/OffersParentCommand';
import { OfferStandaloneCommand } from './commands/OfferStandaloneCommand';

export class BotOfferManager {
  protected readonly messages: HermesMessageService;

  protected readonly offerDomain: OfferDomain;

  protected readonly requestAutocomplete: UserAutocompleteChoiceSource;

  protected readonly actionsSubscriber: AbstractDJSClientSubscriber<Events.InteractionCreate>;

  protected readonly bot: NyxBot;

  protected readonly tagRepository: TagRepository;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    offerDomain: OfferDomain,
    requestAutocomplete: UserAutocompleteChoiceSource,
    actionsSubscriber: AbstractDJSClientSubscriber<Events.InteractionCreate>,
    tagRepository: TagRepository,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.offerDomain = offerDomain;
    this.requestAutocomplete = requestAutocomplete;
    this.actionsSubscriber = actionsSubscriber;
    this.tagRepository = tagRepository;
  }

  public static create(
    bot: NyxBot,
    messages: HermesMessageService,
    offerDomain: OfferDomain,
    tagRepository: TagRepository,
  ) {
    const repository = offerDomain.getRepository();

    const emptyMessage = messages.getOfferMessages().getEmptyMessage();
    const maxLabelLength = DiscordCommandLimits.Autocomplete.Label;
    const requestAutocomplete = UserAutocompleteChoiceSource.create(
      async (interaction) => {
        const userId = interaction.user.id;
        const offers = await repository.fetchFrom(
          userId,
          DiscordCommandLimits.Autocomplete.Max,
        );
        if (!offers.length) {
          return [
            {
              name: emptyMessage,
              value: '-1',
            },
          ];
        }

        return offers.map((offer) => {
          const tags = offer.tags.map((tag) => tag.name).join(', ');

          let name = `${offer.title} - ${tags}`;
          if (name.length > maxLabelLength) {
            name = name.slice(0, maxLabelLength - 1) + '…';
          }

          return {
            name,
            value: offer.id.toString(),
          };
        });
      },
    );

    const subscriber = new ServiceActionInteractionSubscriber(
      offerDomain.getActions(),
      offerDomain.getDiscordAgent(),
    );

    return new BotOfferManager(
      bot,
      messages,
      offerDomain,
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
    const command = new OfferStandaloneCommand(
      this.messages,
      this.offerDomain,
      this.tagRepository,
    );

    await this.bot.commands.addCommand(command);
  }

  protected async setupParentCommand(): Promise<void> {
    const offerMessages = this.messages.getOfferMessages();
    const actions = this.offerDomain.getActions();

    const parentData = offerMessages.getParentCommandData();
    const parent = new OffersParentCommand(parentData);

    const updateData = offerMessages.getUpdateCommandData();
    const updateSubCommand = new OffersActionSubCommand(
      parent,
      updateData,
      updateData.options.offer,
      offerMessages,
      actions,
      this.offerDomain.getRepository(),
      this.requestAutocomplete,
      OfferAction.enum.ReqUpd,
      false,
    );

    const infoData = offerMessages.getInfoCommandData();
    const infoSubCommand = new OffersActionSubCommand(
      parent,
      infoData,
      infoData.options.offer,
      offerMessages,
      actions,
      this.offerDomain.getRepository(),
      this.requestAutocomplete,
      OfferAction.enum.Info,
      true,
    );

    const repostData = offerMessages.getRepostCommandData();
    const repostSubCommand = new OffersActionSubCommand(
      parent,
      repostData,
      repostData.options.offer,
      offerMessages,
      actions,
      this.offerDomain.getRepository(),
      this.requestAutocomplete,
      OfferAction.enum.Repost,
      false,
    );

    const deleteData = offerMessages.getDeleteCommandData();
    const deleteSubCommand = new OffersActionSubCommand(
      parent,
      deleteData,
      deleteData.options.offer,
      offerMessages,
      actions,
      this.offerDomain.getRepository(),
      this.requestAutocomplete,
      OfferAction.enum.Delete,
      true,
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
