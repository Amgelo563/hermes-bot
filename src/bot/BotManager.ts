import type { NyxBot } from '@nyx-discord/core';
import type { Client } from 'discord.js';
import type { HermesConfigWrapper } from '../config/file/HermesConfigWrapper';
import type { HermesMessageService } from '../hermes/message/HermesMessageService';
import type { DiscordServiceAgent } from '../service/discord/DiscordServiceAgent';
import type { ServiceManager } from '../service/ServiceManager';
import type { StickyMessagesDomain } from '../sticky/StickyMessagesDomain';
import { NonMemberActionSubCommandMiddleware } from './action/middleware/NonMemberActionSubCommandMiddleware';
import { BotBlacklistManager } from './blacklist/BotBlacklistManager';
import { BotCommandPlaceholderReplacer } from './message/BotCommandPlaceholderReplacer';
import { BotOfferManager } from './offer/BotOfferManager';
import { BotRequestManager } from './request/BotRequestManager';
import { BotStickyMessagesManager } from './sticky/BotStickyMessagesManager';
import { BotTagManager } from './tag/BotTagManager';

/** Manages objects that connect the bot with the {@link ServiceManager}. */
export class BotManager {
  protected readonly messages: HermesMessageService;

  protected readonly bot: NyxBot;

  protected readonly discordAgent: DiscordServiceAgent;

  protected readonly tag: BotTagManager;

  protected readonly request: BotRequestManager;

  protected readonly offer: BotOfferManager;

  protected readonly blacklist: BotBlacklistManager;

  protected readonly stickyMessages: BotStickyMessagesManager | null;

  constructor(
    messages: HermesMessageService,
    bot: NyxBot,
    discordAgent: DiscordServiceAgent,
    tag: BotTagManager,
    request: BotRequestManager,
    offer: BotOfferManager,
    blacklist: BotBlacklistManager,
    stickyMessages: BotStickyMessagesManager | null,
  ) {
    this.messages = messages;
    this.bot = bot;
    this.tag = tag;
    this.request = request;
    this.offer = offer;
    this.blacklist = blacklist;
    this.discordAgent = discordAgent;
    this.stickyMessages = stickyMessages;
  }

  public static create(
    services: ServiceManager,
    messages: HermesMessageService,
    bot: NyxBot,
    config: HermesConfigWrapper,
    stickyMessagesDomain: StickyMessagesDomain | null,
  ) {
    const tag = BotTagManager.create(
      bot,
      messages,
      services.getTagDomain(),
      config,
    );
    const request = BotRequestManager.create(
      bot,
      messages,
      config,
      services.getRequestDomain(),
      services.getTagDomain().getRepository(),
    );
    const offer = BotOfferManager.create(
      bot,
      messages,
      config,
      services.getOfferDomain(),
      services.getTagDomain().getRepository(),
    );
    const blacklist = BotBlacklistManager.create(
      bot,
      messages,
      config,
      services.getBlacklistDomain(),
    );

    const stickyMessages = stickyMessagesDomain
      ? BotStickyMessagesManager.create(
          bot,
          config.getConfig(),
          stickyMessagesDomain,
        )
      : null;

    return new BotManager(
      messages,
      bot,
      services.getServiceAgent(),
      tag,
      request,
      offer,
      blacklist,
      stickyMessages,
    );
  }

  public async start(): Promise<void> {
    const middleware = new NonMemberActionSubCommandMiddleware(
      this.messages.getGeneralMessages(),
      this.discordAgent,
    );
    this.bot.getCommandManager().getExecutor().getMiddleware().add(middleware);

    await this.tag.start();
    await this.request.start();
    await this.offer.start();
    await this.blacklist.start();

    if (this.stickyMessages !== null) {
      await this.stickyMessages.start();
    }

    const agent = this.discordAgent;
    this.bot
      .getSessionManager()
      .getExecutor()
      .setMissingHandler(async (_sessionId, interaction) => {
        const context = {
          member: await agent.fetchMemberFromInteraction(interaction),
        };
        const embed = this.messages
          .getGeneralMessages()
          .getCancelledEmbed(context);

        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({
            components: [],
            embeds: [embed],
          });
          return;
        }

        await interaction.update({ embeds: [embed] });
      });

    await this.bot.start();
    const replacer = await BotCommandPlaceholderReplacer.fromBot(this.bot);
    this.messages.getPlaceholderManager().addReplacer(replacer);
  }

  public getBot(): NyxBot {
    return this.bot;
  }

  public getClient(): Client {
    return this.bot.getClient();
  }
}
