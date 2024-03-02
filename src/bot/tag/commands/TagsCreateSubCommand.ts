import type {
  CommandExecutionMeta,
  ParentCommand,
  SubCommandData,
} from '@nyx-discord/core';
import { AbstractSubCommand } from '@nyx-discord/framework';
import type {
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
} from 'discord.js';

import type { TagRepository } from '../../../hermes/database/TagRepository';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { TagActionsManager } from '../../../tag/action/TagActionsManager';
import type { DiscordTagAgent } from '../../../tag/discord/DiscordTagAgent';
import type { TagModalCodec } from '../../../tag/modal/TagModalCodec';
import { TagCreateSession } from '../sessions/TagCreateSession';

export class TagsCreateSubCommand extends AbstractSubCommand {
  protected readonly data: SubCommandData;

  protected readonly messages: HermesMessageService;

  protected readonly modalCodec: TagModalCodec;

  protected readonly repository: TagRepository;

  protected readonly agent: DiscordTagAgent;

  protected readonly actions: TagActionsManager;

  protected cachedModal: ModalBuilder | null = null;

  constructor(
    parent: ParentCommand,
    messages: HermesMessageService,
    modalCodec: TagModalCodec,
    repository: TagRepository,
    agent: DiscordTagAgent,
    actions: TagActionsManager,
  ) {
    super(parent);

    this.data = messages.getTagsMessages().getCreateCommandData();
    this.modalCodec = modalCodec;
    this.messages = messages;
    this.repository = repository;
    this.agent = agent;
    this.actions = actions;
  }

  public async execute(
    interaction: ChatInputCommandInteraction,
    meta: CommandExecutionMeta,
  ) {
    if (!this.cachedModal) {
      const modalId = this.getCustomId(meta.getBot());
      this.cachedModal = this.modalCodec.createModal().setCustomId(modalId);
    }

    await interaction.showModal(this.cachedModal);
  }

  protected override async handleModal(
    interaction: ModalSubmitInteraction,
    meta: CommandExecutionMeta,
  ) {
    const data = this.modalCodec.extractFromModal(interaction);
    const bot = meta.getBot();

    const session = new TagCreateSession(
      bot,
      interaction,
      data,
      this.modalCodec,
      this.messages,
      this.repository,
      this.agent,
      this.actions,
    );

    await bot.sessions.start(session);
  }
}
