import type {
  Identifier,
  NyxBot,
  SessionExecutionMeta,
  SessionStartInteraction,
  SessionUpdateInteraction,
} from '@nyx-discord/core';
import { SessionEndCodes } from '@nyx-discord/core';
import { AbstractSession, ActionRowList } from '@nyx-discord/framework';
import type { EmbedBuilder } from 'discord.js';
import { nanoid } from 'nanoid';

import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import type { HermesMember } from '../../service/member/HermesMember';

export abstract class AbstractHermesSession<
  Result = void,
> extends AbstractSession<Result> {
  protected readonly messages: HermesMessageService;

  protected readonly startMember: HermesMember;

  constructor(
    bot: NyxBot,
    startInteraction: SessionStartInteraction,
    messages: HermesMessageService,
    startMember: HermesMember,
  ) {
    super(bot, AbstractHermesSession.createId(), startInteraction);

    this.startMember = startMember;
    this.messages = messages;
  }

  public static createId(): string {
    return nanoid(8);
  }

  public async onEnd(
    _reason: string,
    code: Identifier | number,
    _meta: SessionExecutionMeta,
  ) {
    if (code !== SessionEndCodes.Expired) {
      return;
    }

    const endEmbed = this.getEndEmbed();

    if (this.startInteraction.replied || this.startInteraction.deferred) {
      await this.startInteraction.editReply({
        components: [],
        embeds: [endEmbed],
      });
      return;
    }

    await this.startInteraction.reply({ embeds: [endEmbed], ephemeral: true });
  }

  protected getEndEmbed(): EmbedBuilder {
    const context = {
      member: this.startMember,
    };
    return this.messages.getGeneralMessages().getCancelledEmbed(context);
  }

  protected async disableComponents(
    interaction: SessionUpdateInteraction,
  ): Promise<void> {
    const rowList = ActionRowList.fromMessage(interaction.message);
    rowList.setDisabled();
    await interaction.update({ components: rowList.toRowsData() });
  }
}
