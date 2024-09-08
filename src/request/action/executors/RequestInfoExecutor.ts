import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';

import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { RequestDataWithMember } from '../../data/RequestDataWithMember';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { RequestActionsCustomIdCodec } from '../codec/RequestActionsCustomIdCodec';
import { RequestAction } from '../RequestAction';
import type { RequestActionExecutor } from './RequestActionExecutor';

export class RequestInfoExecutor implements RequestActionExecutor {
  protected readonly messages: HermesMessageService;

  protected readonly actions: RequestActionsCustomIdCodec;

  protected readonly config: HermesConfigWrapper;

  constructor(
    messages: HermesMessageService,
    actions: RequestActionsCustomIdCodec,
    config: HermesConfigWrapper,
  ) {
    this.messages = messages;
    this.actions = actions;
    this.config = config;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordRequestAgent,
    request: RequestDataWithMember,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const member = await agent.fetchMemberFromInteraction(interaction);

    const context = {
      member,
      services: { request },
    };

    const embed = this.messages.getRequestMessages().getPostEmbed(context);
    if (!this.config.canEditRequest(member, request)) {
      await interaction.editReply({ embeds: [embed] });
      return;
    }
    const generalMessages = this.messages.getGeneralMessages();

    const linkButton = this.messages
      .getRequestMessages()
      .getInfoLinkButton(context);

    const editCustomId = this.actions.createActionCustomId(
      request.id,
      RequestAction.enum.ReqUpd,
    );
    const editButton = generalMessages.getUpdateButton(editCustomId, context);

    const deleteCustomId = this.actions.createActionCustomId(
      request.id,
      RequestAction.enum.Delete,
    );
    const deleteButton = generalMessages.getDeleteButton(
      deleteCustomId,
      context,
    );

    const repostButtonId = this.actions.createActionCustomId(
      request.id,
      RequestAction.enum.Repost,
    );
    const repostButton = this.messages
      .getRequestMessages()
      .getRepostButton(repostButtonId, context);

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      linkButton,
      editButton,
      repostButton,
      deleteButton,
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }

  public async defer(interaction: ServiceActionInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
  }
}
