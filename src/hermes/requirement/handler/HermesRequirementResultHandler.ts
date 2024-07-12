import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import type { EmbedBuilder } from 'discord.js';
import { ConfirmationSession } from '../../../bot/sessions/ConfirmationSession';
import type { OptionalInlineField } from '../../../discord/embed/OptionalInlineField';
import type { RequirementResultAggregate } from '../../../requirement/result/aggregate/RequirementResultAggregate';
import { RequirementResultEnum } from '../../../requirement/result/RequirementResultEnum';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../message/HermesMessageService';

type DenyMessagesSource = {
  getWarnEmbed(
    context: HermesPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder;
  getDenyEmbed(
    context: HermesPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder;
};

export class HermesRequirementResultHandler {
  protected readonly bot: NyxBot;

  protected readonly messageService: HermesMessageService;

  constructor(bot: NyxBot, messageService: HermesMessageService) {
    this.bot = bot;
    this.messageService = messageService;
  }

  public async handle(
    requirementResult: RequirementResultAggregate,
    interaction: SessionStartInteraction,
    context: HermesPlaceholderContext,
    denyMessages: DenyMessagesSource,
  ): Promise<boolean> {
    if (requirementResult.result === RequirementResultEnum.Deny) {
      const denyEmbed = denyMessages.getDenyEmbed(
        context,
        requirementResult.deniedBy.fields,
      );
      const embeds: EmbedBuilder[] = [
        denyEmbed,
        ...requirementResult.deniedBy.embeds,
      ];

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          embeds,
        });
      } else {
        await interaction.reply({
          embeds,
          ephemeral: true,
        });
      }

      return false;
    }

    if (requirementResult.result === RequirementResultEnum.Warn) {
      const warnEmbed = denyMessages.getWarnEmbed(
        context,
        requirementResult.deniedBy.fields,
      );
      const embeds: EmbedBuilder[] = [
        warnEmbed,
        ...requirementResult.deniedBy.embeds,
      ];

      const confirmSession = new ConfirmationSession(
        this.bot,
        interaction,
        this.messageService,
        embeds,
        false,
        context,
      );

      await this.bot.getSessionManager().start(confirmSession);

      const endData = await confirmSession.getEndPromise();
      const { result: confirmData } = endData;

      return !!confirmData?.confirmed;
    }

    return true;
  }
}
