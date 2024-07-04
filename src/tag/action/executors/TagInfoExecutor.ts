import type { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';

import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../../hermes/message/HermesMessageService';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagData } from '../../data/TagData';
import type { DiscordTagAgent } from '../../discord/DiscordTagAgent';
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
    agent: DiscordTagAgent,
    tag: TagData,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
      services: {
        tag,
      },
    } satisfies HermesPlaceholderContext;

    const embed = this.messages.getTagsMessages().getInfoEmbed(context);
    if (!this.configWrapper.canEditTags(member)) {
      await interaction.editReply({ embeds: [embed] });

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

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
}
