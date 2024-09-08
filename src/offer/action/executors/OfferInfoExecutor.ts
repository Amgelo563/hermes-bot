import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';

import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { OfferDataWithMember } from '../../data/OfferDataWithMember';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { OfferActionsCustomIdCodec } from '../codec/OfferActionsCustomIdCodec';
import { OfferAction } from '../OfferAction';
import type { OfferActionExecutor } from './OfferActionExecutor';

export class OfferInfoExecutor implements OfferActionExecutor {
  protected readonly messages: HermesMessageService;

  protected readonly actions: OfferActionsCustomIdCodec;

  protected readonly config: HermesConfigWrapper;

  constructor(
    messages: HermesMessageService,
    actions: OfferActionsCustomIdCodec,
    config: HermesConfigWrapper,
  ) {
    this.messages = messages;
    this.actions = actions;
    this.config = config;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordOfferAgent,
    offer: OfferDataWithMember,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
      services: { offer },
    };

    const embed = this.messages.getOfferMessages().getPostEmbed(context);
    if (!this.config.canEditOffer(member, offer)) {
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const generalMessages = this.messages.getGeneralMessages();

    const linkButton = this.messages
      .getOfferMessages()
      .getInfoLinkButton(context);

    const editCustomId = this.actions.createActionCustomId(
      offer.id,
      OfferAction.enum.ReqUpd,
    );
    const editButton = generalMessages.getUpdateButton(editCustomId, context);

    const deleteCustomId = this.actions.createActionCustomId(
      offer.id,
      OfferAction.enum.Delete,
    );
    const deleteButton = generalMessages.getDeleteButton(
      deleteCustomId,
      context,
    );

    const repostButtonId = this.actions.createActionCustomId(
      offer.id,
      OfferAction.enum.Repost,
    );
    const repostButton = this.messages
      .getOfferMessages()
      .getRepostButton(repostButtonId, context);

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      linkButton,
      editButton,
      repostButton,
      deleteButton,
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
    return;
  }

  public async defer(interaction: ServiceActionInteraction): Promise<void> {
    if (
      !interaction.isCommand()
      && (interaction.deferred || interaction.replied)
    ) {
      await interaction.deferUpdate();
    }

    await interaction.deferReply({ ephemeral: true });
  }
}
