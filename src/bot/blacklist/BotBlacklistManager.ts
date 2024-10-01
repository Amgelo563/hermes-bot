import type { NyxBot } from '@nyx-discord/core';
import type { AbstractDJSClientSubscriber } from '@nyx-discord/framework';
import type { Events } from 'discord.js';

import { BlacklistAction } from '../../blacklist/action/BlacklistAction';
import type { BlacklistDomain } from '../../blacklist/BlacklistDomain';
import type { HermesConfigWrapper } from '../../config/file/HermesConfigWrapper';
import type { HermesErrorAgent } from '../../error/HermesErrorAgent';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { ServiceActionInteractionSubscriber } from '../action/events/ServiceActionInteractionSubscriber';
import { BlacklistActionSubCommand } from './commands/BlacklistActionSubCommand';
import { BlacklistCreateSubCommand } from './commands/BlacklistCreateSubCommand';
import { BlacklistListSubCommand } from './commands/BlacklistListSubCommand';
import { BlacklistParentCommand } from './commands/BlacklistParentCommand';
import { BlacklistExpireSchedule } from './schedule/BlacklistExpireSchedule';

export class BotBlacklistManager {
  protected readonly messages: HermesMessageService;

  protected readonly blacklistDomain: BlacklistDomain;

  protected readonly actionsSubscriber: AbstractDJSClientSubscriber<Events.InteractionCreate>;

  protected readonly bot: NyxBot;

  protected readonly config: HermesConfigWrapper;

  protected readonly errorAgent: HermesErrorAgent;

  constructor(
    bot: NyxBot,
    messages: HermesMessageService,
    config: HermesConfigWrapper,
    blacklistDomain: BlacklistDomain,
    errorAgent: HermesErrorAgent,
    actionsSubscriber: AbstractDJSClientSubscriber<Events.InteractionCreate>,
  ) {
    this.bot = bot;
    this.messages = messages;
    this.blacklistDomain = blacklistDomain;
    this.actionsSubscriber = actionsSubscriber;
    this.config = config;
    this.errorAgent = errorAgent;
  }

  public static create(
    bot: NyxBot,
    messages: HermesMessageService,
    config: HermesConfigWrapper,
    blacklistDomain: BlacklistDomain,
    errorAgent: HermesErrorAgent,
  ) {
    const actionsSubscriber = new ServiceActionInteractionSubscriber(
      blacklistDomain.getActions(),
    );

    return new BotBlacklistManager(
      bot,
      messages,
      config,
      blacklistDomain,
      errorAgent,
      actionsSubscriber,
    );
  }

  public async start(): Promise<void> {
    await this.setupParentCommand();
    await this.setupExpireSchedule();
    await this.bot.getEventManager().subscribeClient(this.actionsSubscriber);
  }

  protected async setupParentCommand(): Promise<void> {
    const blacklistMessages = this.messages.getBlacklistMessages();
    const actions = this.blacklistDomain.getActions();
    const repository = this.blacklistDomain.getRepository();
    const agent = this.blacklistDomain.getAgent();

    const parentData = blacklistMessages.getParentCommandData();
    const parent = new BlacklistParentCommand(parentData);

    const infoData = blacklistMessages.getInfoCommandData();
    const infoSubCommand = new BlacklistActionSubCommand(
      parent,
      infoData,
      this.config,
      agent,
      blacklistMessages,
      actions,
      BlacklistAction.enum.Info,
      repository,
      false,
    );

    const deleteData = blacklistMessages.getDeleteCommandData();
    const deleteSubCommand = new BlacklistActionSubCommand(
      parent,
      deleteData,
      this.config,
      agent,
      blacklistMessages,
      actions,
      BlacklistAction.enum.Delete,
      repository,
      true,
      false,
    );

    const createData = blacklistMessages.getCreateCommandData();
    const createSubCommand = new BlacklistCreateSubCommand(
      parent,
      createData,
      this.config,
      agent,
      blacklistMessages,
      actions,
      repository,
      this.blacklistDomain.getModalCodec(),
    );

    const listData = blacklistMessages.getListCommandData();
    const listSubCommand = new BlacklistListSubCommand(
      parent,
      listData,
      repository,
      agent,
      this.messages,
    );

    parent.addChildren(
      infoSubCommand,
      deleteSubCommand,
      createSubCommand,
      listSubCommand,
    );

    await this.bot.getCommandManager().addCommands(parent);
  }

  protected async setupExpireSchedule(): Promise<void> {
    const schedule = new BlacklistExpireSchedule(
      this.blacklistDomain.getRepository(),
      this.blacklistDomain.getAgent(),
      this.messages.getBlacklistMessages(),
      this.errorAgent,
    );

    await this.bot.getScheduleManager().addSchedule(schedule);
  }
}
