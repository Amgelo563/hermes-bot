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
import { SlashCommandBuilder } from 'discord.js';

import type { CommandSchemaType } from '../../../discord/command/DiscordCommandSchema';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { OfferDomain } from '../../../offer/OfferDomain';
import type { TagRepository } from '../../../tag/database/TagRepository';
import { OfferCreateSession } from '../sessions/OfferCreateSession';

export class OfferStandaloneCommand extends AbstractStandaloneCommand {
  protected readonly data: CommandSchemaType;

  protected readonly messages: HermesMessageService;

  protected readonly tagRepository: TagRepository;

  protected readonly offerDomain: OfferDomain;

  protected cachedModal: ModalBuilder | null = null;

  constructor(
    messages: HermesMessageService,
    offerDomain: OfferDomain,
    tagRepository: TagRepository,
  ) {
    super();

    this.data = messages.getOfferMessages().getCreateCommandData();
    this.messages = messages;
    this.offerDomain = offerDomain;
    this.tagRepository = tagRepository;
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
    meta: CommandExecutionMeta,
  ) {
    if (!this.cachedModal) {
      const modalId = this.getCustomId(meta.getBot());
      this.cachedModal = this.offerDomain.getModalCodec().createModal(modalId);
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
    const member = await this.offerDomain
      .getDiscordAgent()
      .fetchMemberFromInteraction(interaction);
    const data = this.offerDomain
      .getModalCodec()
      .extractFromModal(interaction, member);
    const bot = meta.getBot();

    const session = new OfferCreateSession(
      bot,
      interaction,
      data,
      this.messages,
      this.offerDomain.getModalCodec(),
      this.offerDomain.getRequirements(),
      this.offerDomain.getActions(),
      member,
      this.tagRepository.getTags(),
    );

    await bot.getSessionManager().start(session);
  }

  protected createData(): SlashCommandOptionsOnlyBuilder {
    return new SlashCommandBuilder()
      .setName(this.data.name)
      .setDescription(this.data.description)
      .setDMPermission(false);
  }
}
