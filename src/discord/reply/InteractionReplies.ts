import type { RepliableInteraction } from 'discord.js';

export async function deferReplyOrUpdate(
  interaction: RepliableInteraction,
): Promise<void> {
  if (interaction.replied || interaction.deferred) return;

  if (
    interaction.isCommand()
    || (interaction.isModalSubmit() && !interaction.isFromMessage())
  ) {
    await interaction.deferReply({ ephemeral: true });
  } else {
    await interaction.deferUpdate();
  }
}
