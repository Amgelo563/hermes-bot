import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import type { HermesConfigWrapper } from '../../../config/HermesConfigWrapper';

import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagData } from '../../../service/tag/TagData';
import type { TagActionsCustomIdCodec } from '../codec/TagActionsCustomIdCodec';
import { TagAction } from '../TagAction';
import type { TagActionExecutor } from './TagActionExecutor';

export class TagInfoExecutor implements TagActionExecutor {
  protected readonly messages: HermesMessageService;

  protected readonly actions: TagActionsCustomIdCodec;

  protected readonly configWrapper: HermesConfigWrapper;

  constructor(
    messages: HermesMessageService,
    codec: TagActionsCustomIdCodec,
    configWrapper: HermesConfigWrapper,
  ) {
    this.messages = messages;
    this.actions = codec;
    this.configWrapper = configWrapper;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    member: HermesMember,
    tag: TagData,
  ): Promise<void> {
    const context = {
      member,
      services: {
        tag,
      },
    } satisfies HermesPlaceholderContext;

    const embed = this.messages.getTagsMessages().getInfoEmbed(context);
    if (!this.configWrapper.canEditTags(member)) {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      return;
    }

    const generalMessages = this.messages.getGeneralMessages();

    const deleteCustomId = this.actions.createActionCustomId(
      tag.id,
      TagAction.enum.Delete,
    );
    const deleteButton = generalMessages.getDeleteButton(
      deleteCustomId,
      context,
    );

    const updateCustomId = this.actions.createActionCustomId(
      tag.id,
      TagAction.enum.ReqUpd,
    );

    const updateButton = generalMessages.getUpdateButton(
      updateCustomId,
      context,
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
      updateButton,
      deleteButton,
    ]);

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [embed], components: [row] });
    } else {
      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    }
  }
}
