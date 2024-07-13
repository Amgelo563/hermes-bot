import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import type {
  ButtonBuilder,
  ButtonInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagActionsManager } from '../../../tag/action/TagActionsManager';
import type { TagCreateData } from '../../../tag/data/TagCreateData';
import type { TagData } from '../../../tag/data/TagData';

import type { TagRepository } from '../../../tag/database/TagRepository';
import type { DiscordTagAgent } from '../../../tag/discord/DiscordTagAgent';
import type { TagModalCodec } from '../../../tag/modal/TagModalCodec';
import { AbstractHermesSession } from '../../sessions/AbstractHermesSession';

export class TagCreateSession extends AbstractHermesSession {
  protected static readonly ButtonIndex = 0;

  protected static readonly ButtonIds = {
    Edit: 'e',
    Confirm: 'c',
  };

  protected readonly editButtonId: string;

  protected readonly confirmButtonId: string;

  protected readonly modalCodec: TagModalCodec;

  protected readonly repository: TagRepository;

  protected readonly agent: DiscordTagAgent;

  protected readonly actions: TagActionsManager;

  protected tag: TagCreateData;

  constructor(
    bot: NyxBot,
    startInteraction: SessionStartInteraction,
    tag: TagCreateData,
    modalCodec: TagModalCodec,
    messages: HermesMessageService,
    repository: TagRepository,
    agent: DiscordTagAgent,
    actions: TagActionsManager,
    startMember: HermesMember,
  ) {
    super(bot, startInteraction, messages, startMember);

    this.tag = tag;
    this.modalCodec = modalCodec;
    this.editButtonId = this.customId
      .cloneSetAt(TagCreateSession.ButtonIndex, TagCreateSession.ButtonIds.Edit)
      .build();
    this.confirmButtonId = this.customId
      .cloneSetAt(
        TagCreateSession.ButtonIndex,
        TagCreateSession.ButtonIds.Confirm,
      )
      .build();
    this.repository = repository;
    this.agent = agent;
    this.actions = actions;
  }

  public async onStart() {
    const message = this.buildMessage();

    await this.startInteraction.reply(message);
  }

  protected async handleButton(interaction: ButtonInteraction) {
    if (interaction.customId === this.editButtonId) {
      const modal = this.modalCodec.createModal(
        this.customId.build(),
        this.tag,
      );

      await interaction.showModal(modal);

      return true;
    }

    await this.selfEnd('End');
    await this.actions.create(interaction, this.tag);

    return true;
  }

  protected async handleModal(interaction: ModalSubmitInteraction) {
    if (!interaction.isFromMessage()) {
      return false;
    }

    this.tag = this.modalCodec.extractFromModal(interaction);

    const message = this.buildMessage();
    await interaction.update(message);

    return true;
  }

  protected buildMessage() {
    const fullTag: TagData = { ...this.tag, id: 0, createdAt: new Date() };

    const context = {
      member: this.startMember,
      services: { tag: fullTag },
    };

    const generalMessages = this.messages.getGeneralMessages();
    const tagsMessages = this.messages.getTagsMessages();

    const embed = tagsMessages.getInfoEmbed(context);

    const editButton = generalMessages.getUpdateButton(
      this.editButtonId,
      context,
    );
    const confirmButton = generalMessages.getConfirmButton(
      this.confirmButtonId,
      context,
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
      editButton,
      confirmButton,
    ]);

    return {
      embeds: [embed],
      components: [row],
      ephemeral: true,
    };
  }
}
