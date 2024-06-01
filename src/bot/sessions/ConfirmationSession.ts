import type { NyxBot, SessionStartInteraction } from '@nyx-discord/core';
import type { ButtonInteraction, EmbedBuilder } from 'discord.js';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import { AbstractHermesSession } from './AbstractHermesSession';

type ConfirmResult =
  | {
      confirmed: true;
      button: ButtonInteraction;
    }
  | {
      confirmed: false;
      button: ButtonInteraction;
    }
  | {
      confirmed: null;
      button: null;
    };

export class ConfirmationSession extends AbstractHermesSession<ConfirmResult> {
  protected static readonly ButtonOptions = {
    Yes: 'y',
    No: 'n',
  };

  protected static readonly OptionIndex = 0;

  protected readonly isSafe: boolean;

  protected readonly yesId: string;

  protected readonly noId: string;

  protected readonly embeds: EmbedBuilder[];

  protected readonly context: HermesPlaceholderContext;

  protected result: ConfirmResult = {
    confirmed: null,
    button: null,
  };

  constructor(
    bot: NyxBot,
    startInteraction: SessionStartInteraction,
    messages: HermesMessageService,
    embeds: EmbedBuilder[],
    isSafe: boolean,
    context: HermesPlaceholderContext,
  ) {
    super(bot, startInteraction, messages, context.member);

    this.isSafe = isSafe;
    this.yesId = this.customId
      .cloneSetAt(
        ConfirmationSession.OptionIndex,
        ConfirmationSession.ButtonOptions.Yes,
      )
      .build();
    this.noId = this.customId
      .cloneSetAt(
        ConfirmationSession.OptionIndex,
        ConfirmationSession.ButtonOptions.No,
      )
      .build();

    this.embeds = embeds;
    this.context = context;
  }

  public async start(): Promise<void> {
    const messages = this.messages.getGeneralMessages();

    const row = messages.getContinueRow(
      this.yesId,
      this.noId,
      this.context,
      this.isSafe,
    );

    await this.startInteraction.editReply({
      embeds: this.embeds,
      components: [row],
    });
  }

  protected override async handleButton(
    interaction: ButtonInteraction,
  ): Promise<boolean> {
    const iterator = this.codec.createIteratorFromCustomId(
      interaction.customId,
    );
    if (!iterator) return false;

    const selection = iterator.getAt(ConfirmationSession.OptionIndex);
    if (!selection) return false;

    if (selection === ConfirmationSession.ButtonOptions.Yes) {
      this.result = {
        confirmed: true,
        button: interaction,
      };
    } else {
      this.result = {
        confirmed: false,
        button: interaction,
      };

      const embed = this.getEndEmbed();
      await interaction.update({
        embeds: [embed],
        components: [],
      });
    }

    await this.selfEnd('Finished');

    return true;
  }
}
