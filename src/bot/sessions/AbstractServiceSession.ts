import type {
  NyxBot,
  SessionStartInteraction,
  SessionUpdateInteraction,
} from '@nyx-discord/core';
import { SessionSelfEndCode } from '@nyx-discord/core';
import type { ActionRowWrapper } from '@nyx-discord/framework';
import type { APIButtonComponentWithCustomId } from 'discord-api-types/v10';
import type {
  ActionRowData,
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { type ModalSubmitInteraction } from 'discord.js';

import { DiscordEmbedLimits } from '../../discord/embed/DiscordEmbedLimits';
import type { OptionalInlineField } from '../../discord/embed/OptionalInlineField';
import type { DiscordModalCodec } from '../../discord/modal/codec/DiscordModalCodec';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import type { HermesMessageService } from '../../hermes/message/HermesMessageService';
import type { RequirementResultAggregate } from '../../requirement/result/aggregate/RequirementResultAggregate';
import { RequirementResultEnum } from '../../requirement/result/RequirementResultEnum';
import { AbstractHermesSession } from './AbstractHermesSession';

export abstract class AbstractServiceSession<
  Data,
> extends AbstractHermesSession {
  protected static readonly ButtonIndex = 0;

  protected static readonly ButtonIds = {
    Cancel: 'ca',
    Edit: 'e',
    Confirm: 'co',
  };

  protected readonly buttonIds: Record<
    keyof (typeof AbstractServiceSession)['ButtonIds'],
    string
  >;

  protected readonly buttonRow: ActionRowWrapper<ButtonBuilder>;

  protected readonly modalCodec: DiscordModalCodec<Data>;

  protected readonly selectMenuRow: ActionRowWrapper<StringSelectMenuBuilder> | null =
    null;

  protected abstract cachedContext: HermesPlaceholderContext;

  protected data: Data;

  protected modal: ModalBuilder;

  constructor(
    bot: NyxBot,
    startInteraction: SessionStartInteraction,
    data: Data,
    messages: HermesMessageService,
    modalCodec: DiscordModalCodec<Data>,
  ) {
    super(bot, startInteraction, messages);

    this.data = data;
    this.modalCodec = modalCodec;

    const editId = this.customId
      .cloneSetAt(
        AbstractServiceSession.ButtonIndex,
        AbstractServiceSession.ButtonIds.Edit,
      )
      .build();
    const confirmId = this.customId
      .cloneSetAt(
        AbstractServiceSession.ButtonIndex,
        AbstractServiceSession.ButtonIds.Confirm,
      )
      .build();
    const cancelId = this.customId
      .cloneSetAt(
        AbstractServiceSession.ButtonIndex,
        AbstractServiceSession.ButtonIds.Cancel,
      )
      .build();

    this.buttonIds = {
      Edit: editId,
      Confirm: confirmId,
      Cancel: cancelId,
    };

    this.modal = modalCodec.createFromData(this.data, this.customId.build());

    this.buttonRow = this.createButtonRow();
  }

  public async start(): Promise<void> {
    if (!this.startInteraction.replied && !this.startInteraction.deferred) {
      if (
        this.startInteraction.isCommand()
        || (this.startInteraction.isModalSubmit()
          && !this.startInteraction.isFromMessage())
      ) {
        await this.startInteraction.deferReply({ ephemeral: true });
      } else {
        await this.startInteraction.deferUpdate();
      }
    }

    await this.buildAndReply(this.startInteraction);
  }

  protected async handleModal(
    interaction: ModalSubmitInteraction,
  ): Promise<boolean> {
    if (!interaction.isFromMessage()) {
      return false;
    }
    await interaction.deferUpdate();

    this.data = {
      ...this.data,
      ...this.modalCodec.extractFromModal(interaction),
    };
    this.onDataUpdate();

    this.modal = this.modalCodec.createFromData(
      this.data,
      this.customId.build(),
    );

    await this.buildAndReply(interaction);

    return true;
  }

  protected async handleButton(
    interaction: ButtonInteraction,
  ): Promise<boolean> {
    if (interaction.customId === this.buttonIds.Edit) {
      await interaction.showModal(this.modal);

      return true;
    }

    if (interaction.customId === this.buttonIds.Confirm) {
      await this.disableComponents(interaction);
      await this.handleConfirm(interaction);

      await this.selfEnd(SessionSelfEndCode.toString());
      return true;
    }

    if (interaction.customId === this.buttonIds.Cancel) {
      const cancelled = this.getEndEmbed();
      await interaction.update({ embeds: [cancelled], components: [] });

      await this.selfEnd(SessionSelfEndCode.toString());
      return true;
    }

    return true;
  }

  protected async buildAndReply(
    interaction: SessionStartInteraction | SessionUpdateInteraction,
  ): Promise<void> {
    const requirements = await this.checkRequirements();
    const message = this.buildMessage(requirements);
    await interaction.editReply(message);
  }

  protected buildMessage(requirements: RequirementResultAggregate) {
    const previewingEmbed = this.getPreviewingEmbed(this.cachedContext);
    const postEmbed = this.getPostEmbed(this.cachedContext);
    let embeds = [previewingEmbed, postEmbed];

    if (!requirements.warnedBy.empty) {
      const warnEmbed = this.getWarnEmbed(
        this.cachedContext,
        requirements.warnedBy.fields,
      );

      embeds.push(warnEmbed, ...requirements.warnedBy.embeds);
    }

    if (!requirements.deniedBy.empty) {
      const denyEmbed = this.getDenyEmbed(
        this.cachedContext,
        requirements.deniedBy.fields,
      );

      embeds.push(denyEmbed, ...requirements.deniedBy.embeds);
    }

    this.updateConfirmButton(
      requirements.result === RequirementResultEnum.Allow
        && this.allowConfirm(),
    );

    const components: ActionRowData<any>[] = [this.buttonRow.toRowData()];
    if (this.selectMenuRow) {
      components.push(this.selectMenuRow.toRowData());
    }

    embeds = embeds.slice(0, DiscordEmbedLimits.Message);

    return { embeds, components, ephemeral: true };
  }

  protected updateConfirmButton(allowConfirm: boolean): void {
    this.buttonRow.forEach((button) => {
      if (
        (button.data as APIButtonComponentWithCustomId).custom_id
        === this.buttonIds.Confirm
      ) {
        button.setDisabled(!allowConfirm);
      }
    });
  }

  protected createButtonRow(): ActionRowWrapper<ButtonBuilder> {
    const generalMessages = this.messages.getGeneralMessages();
    return generalMessages.getSessionCreateRow(
      this.buttonIds.Cancel,
      this.buttonIds.Edit,
      this.buttonIds.Confirm,
      this.cachedContext,
      false,
    );
  }

  protected allowConfirm(): boolean {
    return true;
  }

  protected abstract onDataUpdate(): void;

  protected abstract checkRequirements(): Promise<RequirementResultAggregate>;

  protected abstract handleConfirm(
    interaction: ButtonInteraction,
  ): Promise<void>;

  protected abstract getPostEmbed(
    context: HermesPlaceholderContext,
  ): EmbedBuilder;

  protected abstract getWarnEmbed(
    context: HermesPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder;

  protected abstract getDenyEmbed(
    context: HermesPlaceholderContext,
    reasons: OptionalInlineField[],
  ): EmbedBuilder;

  protected abstract getPreviewingEmbed(
    context: HermesPlaceholderContext,
  ): EmbedBuilder;

  protected abstract handleSelectMenu(
    interaction: StringSelectMenuInteraction,
  ): Promise<boolean>;
}
