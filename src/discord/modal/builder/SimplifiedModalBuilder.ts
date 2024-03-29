import type { TextInputBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ModalBuilder } from 'discord.js';

// Modals can only have one text input per row, this class removes the need to manually add that
export class SimplifiedModalBuilder extends ModalBuilder {
  public addTextInputs(...textInputs: TextInputBuilder[]): this {
    const components = textInputs.map((textInput) => {
      return new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    });

    this.addComponents(...components);

    return this;
  }

  public setTextInputs(...textInputs: TextInputBuilder[]): this {
    const components = textInputs.map((textInput) => {
      return new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    });

    this.setComponents(...components);

    return this;
  }
}
