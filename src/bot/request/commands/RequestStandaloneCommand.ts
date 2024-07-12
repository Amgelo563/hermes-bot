import { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandExecutionMeta } from '@nyx-discord/core';
import {
  AbstractStandaloneCommand,
  NotImplementedError,
} from '@nyx-discord/framework';
import type {
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';

import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { RequestDomain } from '../../../request/RequestDomain';
import type { TagRepository } from '../../../tag/database/TagRepository';
import { RequestCreateSession } from '../sessions/RequestCreateSession';

export class RequestStandaloneCommand extends AbstractStandaloneCommand {
  protected readonly data: CommandSchemaType;

  protected readonly messages: HermesMessageService;

  protected readonly tagRepository: TagRepository;

  protected readonly requestDomain: RequestDomain;

  protected cachedModal: ModalBuilder | null = null;

  constructor(
    messages: HermesMessageService,
    requestDomain: RequestDomain,
    tagRepository: TagRepository,
  ) {
    super();

    this.data = messages.getRequestMessages().getCreateCommandData();
    this.requestDomain = requestDomain;
    this.messages = messages;
    this.tagRepository = tagRepository;
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
    meta: CommandExecutionMeta,
  ): Promise<void> {
    if (!this.cachedModal) {
      const modalId = this.getCustomId(meta.getBot());
      this.cachedModal = this.requestDomain
        .getModalCodec()
        .createModal(modalId);
    }

    await interaction.showModal(this.cachedModal);
  }

  public autocomplete(): void {
    throw new NotImplementedError();
  }

  protected override async handleModal(
    interaction: ModalSubmitInteraction,
    meta: CommandExecutionMeta,
  ) {
    const member = await this.requestDomain
      .getDiscordAgent()
      .fetchMemberFromInteraction(interaction);

    const data = this.requestDomain
      .getModalCodec()
      .extractFromModal(interaction);
    const bot = meta.getBot();

    const session = new RequestCreateSession(
      bot,
      interaction,
      data,
      this.messages,
      this.requestDomain.getModalCodec(),
      this.requestDomain.getRequirements(),
      this.requestDomain.getActions(),
      member,
      this.tagRepository.getTags(),
    );

    await bot.getSessionManager().start(session);
  }

  protected createData(): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
      .setName(this.data.name)
      .setDescription(this.data.description)
      .setDMPermission(true);
  }
}
