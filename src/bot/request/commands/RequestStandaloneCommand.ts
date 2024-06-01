import type {
  CommandExecutionMeta,
  StandaloneCommandData} from '@nyx-discord/core';
import {
  ObjectNotFoundError
} from '@nyx-discord/core';
import { AbstractStandaloneCommand } from '@nyx-discord/framework';
import type {
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import type { TagRepository } from '../../../hermes/database/TagRepository';

import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { RequestDomain } from '../../../request/RequestDomain';
import type { HermesMember } from '../../../service/member/HermesMember';
import { HermesMemberFetchCommandMiddleware } from '../../middleware/HermesMemberFetchCommandMiddleware';
import { RequestCreateSession } from '../sessions/RequestCreateSession';

export class RequestStandaloneCommand extends AbstractStandaloneCommand {
  protected readonly data: StandaloneCommandData;

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

    this.data = {
      ...messages.getRequestMessages().getCreateCommandData(),
      dmPermission: false,
    };

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

  protected override async handleModal(
    interaction: ModalSubmitInteraction,
    meta: CommandExecutionMeta,
  ) {
    const member = meta.get(HermesMemberFetchCommandMiddleware.Key) as
      | HermesMember
      | undefined;
    if (!member) {
      throw new ObjectNotFoundError();
    }

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

    await bot.sessions.start(session);
  }
}
