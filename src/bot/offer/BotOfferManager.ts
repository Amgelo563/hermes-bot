import type { NyxBot } from '@nyx-discord/core';
import type { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { Events, GuildMember } from 'discord.js';

import { UserAutocompleteChoiceSource } from '../../autocomplete/UserAutocompleteChoiceSource';
import type { HermesConfigWrapper } from '../../config/file/HermesConfigWrapper';
import { DiscordCommandLimits } from '../../discord/command/DiscordCommandLimits';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { OfferAction } from '../../offer/action/OfferAction';
import type { OfferDomain } from '../../offer/OfferDomain';
import type { TagRepository } from '../../tag/database/TagRepository';
import { ServiceActionInteractionSubscriber } from '../action/events/ServiceActionInteractionSubscriber';
import { OfferActionSubCommand } from './commands/OfferActionSubCommand';
import { OfferSearchSubCommand } from './commands/OfferSearchSubCommand';
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
    config: HermesConfigWrapper,
    offerDomain: OfferDomain,
    tagRepository: TagRepository,
  ) {
    const repository = offerDomain.getRepository();
    const emptyMessage = messages.getOfferMessages().getEmptyMessage();
    const maxLabelLength = DiscordCommandLimits.Autocomplete.Label;

    const requestAutocomplete = UserAutocompleteChoiceSource.create(
      async (interaction) => {
        const member = interaction.member as GuildMember | null;
        const userId = interaction.user.id;
        const offers =
          member && config.isStaff(member)
            ? await repository.findAll(DiscordCommandLimits.Autocomplete.Max)
            : await repository.fetchFrom(
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
    await this.bot.getEventManager().subscribeClient(this.actionsSubscriber);
  }

  protected async setupStandaloneCommand() {
    const command = new OfferStandaloneCommand(
      this.messages,
      this.offerDomain,
      this.tagRepository,
    );

    await this.bot.getCommandManager().addCommands(command);
  }

  protected async setupParentCommand(): Promise<void> {
    const offerMessages = this.messages.getOfferMessages();
    const actions = this.offerDomain.getActions();
    const agent = this.offerDomain.getDiscordAgent();
    const offerRepository = this.offerDomain.getRepository();

    const parentData = offerMessages.getParentCommandData();
    const parent = new OffersParentCommand(parentData);

    const updateData = offerMessages.getUpdateCommandData();
    const updateSubCommand = new OfferActionSubCommand(
      parent,
      updateData,
      updateData.options.offer,
      offerMessages,
      actions,
      offerRepository,
      this.requestAutocomplete,
      OfferAction.enum.ReqUpd,
      agent,
      false,
    );

    const infoData = offerMessages.getInfoCommandData();
    const infoSubCommand = new OfferActionSubCommand(
      parent,
      infoData,
      infoData.options.offer,
      offerMessages,
      actions,
      offerRepository,
      this.requestAutocomplete,
      OfferAction.enum.Info,
      agent,
    );

    const repostData = offerMessages.getRepostCommandData();
    const repostSubCommand = new OfferActionSubCommand(
      parent,
      repostData,
      repostData.options.offer,
      offerMessages,
      actions,
      offerRepository,
      this.requestAutocomplete,
      OfferAction.enum.Repost,
      agent,
      false,
    );

    const deleteData = offerMessages.getDeleteCommandData();
    const deleteSubCommand = new OfferActionSubCommand(
      parent,
      deleteData,
      deleteData.options.offer,
      offerMessages,
      actions,
      offerRepository,
      this.requestAutocomplete,
      OfferAction.enum.Delete,
      agent,
    );

    const searchData = offerMessages.getSearchCommandData();
    const searchSubCommand = new OfferSearchSubCommand(
      parent,
      searchData,
      this.tagRepository,
      offerMessages,
      offerRepository,
      agent,
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
