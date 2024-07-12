import type { NyxBot } from '@nyx-discord/core';
import type { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import { SubscriberCallbackWrapper } from '@nyx-discord/framework';
import type { Events } from 'discord.js';

import { PermanentAutocompleteChoiceSource } from '../../autocomplete/PermanentAutocompleteChoiceSource';
import type { HermesConfigWrapper } from '../../config/file/HermesConfigWrapper';
import { DiscordCommandLimits } from '../../discord/command/DiscordCommandLimits';
import type { RepositoryEventArgs } from '../../hermes/database/event/RepositoryEvent';
import { RepositoryEventEnum } from '../../hermes/database/event/RepositoryEvent';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { TagAction } from '../../tag/action/TagAction';
import type { TagData } from '../../tag/data/TagData';
import type { TagDomain } from '../../tag/TagDomain';
import { ServiceActionInteractionSubscriber } from '../action/ServiceActionInteractionSubscriber';
import { TagActionSubCommand } from './commands/TagActionSubCommand';
import { TagsCreateSubCommand } from './commands/TagsCreateSubCommand';
import { TagsListSubCommand } from './commands/TagsListSubCommand';
import { TagsParentCommand } from './commands/TagsParentCommand';

/** Manages objects that connect the bot with the {@link TagDomain}. */
export class BotTagManager {
  protected readonly messages: HermesMessageService;

  protected readonly tagDomain: TagDomain;

  protected readonly tagAutocomplete: PermanentAutocompleteChoiceSource;

  protected readonly actionsSubscriber: AbstractDJSClientSubscriber<Events.InteractionCreate>;

  protected readonly bot: NyxBot;

  protected readonly config: HermesConfigWrapper;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    tagDomain: TagDomain,
    tagAutocomplete: PermanentAutocompleteChoiceSource,
    actionsSubscriber: AbstractDJSClientSubscriber<Events.InteractionCreate>,
    config: HermesConfigWrapper,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.tagDomain = tagDomain;
    this.tagAutocomplete = tagAutocomplete;
    this.actionsSubscriber = actionsSubscriber;
    this.config = config;
  }

  public static create(
    bot: NyxBot,
    messages: HermesMessageService,
    tagDomain: TagDomain,
    config: HermesConfigWrapper,
  ): BotTagManager {
    const tagAutocomplete = new PermanentAutocompleteChoiceSource([]);
    const subscriber = new ServiceActionInteractionSubscriber(
      tagDomain.getActions(),
    );

    return new BotTagManager(
      bot,
      messages,
      tagDomain,
      tagAutocomplete,
      subscriber,
      config,
    );
  }

  public async start() {
    this.setupAutocomplete();
    await this.setupCommand();
    await this.bot.getEventManager().subscribeClient(this.actionsSubscriber);
  }

  public getAutocomplete(): PermanentAutocompleteChoiceSource {
    return this.tagAutocomplete;
  }

  protected async setupCommand() {
    const tagMessages = this.tagDomain.getMessages();
    const actions = this.tagDomain.getActions();
    const repo = this.tagDomain.getRepository();
    const agent = this.tagDomain.getTagAgent();

    const parent = new TagsParentCommand(tagMessages.getParentCommandData());

    const list = new TagsListSubCommand(
      parent,
      tagMessages,
      actions.getCodec(),
      repo,
      agent,
    );
    const add = new TagsCreateSubCommand(
      parent,
      this.messages,
      this.tagDomain.getModalCodec(),
      repo,
      agent,
      actions,
      this.config,
    );

    const infoData = tagMessages.getInfoCommandData();
    const info = new TagActionSubCommand(
      parent,
      infoData,
      infoData.options.tag,
      tagMessages,
      actions,
      repo,
      this.tagAutocomplete,
      TagAction.enum.Info,
      agent,
    );

    const deleteData = tagMessages.getDeleteCommandData();
    const deleteSubCommand = new TagActionSubCommand(
      parent,
      deleteData,
      deleteData.options.tag,
      tagMessages,
      actions,
      repo,
      this.tagAutocomplete,
      TagAction.enum.Delete,
      agent,
      false,
    );

    parent.addChildren(list, add, info, deleteSubCommand);

    await this.bot.getCommandManager().addCommands(parent);
  }

  protected setupAutocomplete() {
    const repo = this.tagDomain.getRepository();
    const tags = repo.getTags();
    this.updateAutocomplete(tags);

    const addSubscriber = new SubscriberCallbackWrapper<
      RepositoryEventArgs<TagData>,
      typeof RepositoryEventEnum.Create
    >(RepositoryEventEnum.Create, () => {
      this.updateAutocomplete(this.tagDomain.getRepository().getTags());
    });

    const removeSubscriber = new SubscriberCallbackWrapper<
      RepositoryEventArgs<TagData>,
      typeof RepositoryEventEnum.Remove
    >(RepositoryEventEnum.Remove, () => {
      this.updateAutocomplete(this.tagDomain.getRepository().getTags());
    });

    const updateSubscriber = new SubscriberCallbackWrapper<
      RepositoryEventArgs<TagData>,
      typeof RepositoryEventEnum.Update
    >(RepositoryEventEnum.Update, () => {
      this.updateAutocomplete(this.tagDomain.getRepository().getTags());
    });

    [addSubscriber, removeSubscriber, updateSubscriber].forEach(
      (subscriber) => {
        void repo.getBus().subscribe(subscriber);
      },
    );
  }

  protected updateAutocomplete(tags: TagData[]) {
    const maxLabelLength = DiscordCommandLimits.Autocomplete.Label;

    this.tagAutocomplete.setChoices(
      tags.map((tag) => {
        let name = `${tag.name} - ${tag.description}`;
        if (name.length > maxLabelLength) {
          name = name.slice(0, maxLabelLength - 1) + '…';
        }

        return {
          name,
          value: tag.id.toString(),
        };
      }),
    );
  }
}
