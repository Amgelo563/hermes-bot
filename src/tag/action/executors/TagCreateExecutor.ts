import type { GuildMember } from 'discord.js';
import { nanoid } from 'nanoid';
import type { HermesConfigWrapper } from '../../../config/HermesConfigWrapper';
import type { TagRepository } from '../../../hermes/database/TagRepository';
import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagCreateData } from '../../../service/tag/TagCreateData';
import type { DiscordTagAgent } from '../../discord/DiscordTagAgent';
import type { TagMessagesParser } from '../../message/TagMessagesParser';

export class TagCreateExecutor implements ServiceActionExecutor<TagCreateData> {
  protected readonly tagMessages: TagMessagesParser;

  protected readonly repository: TagRepository;

  protected readonly agent: DiscordTagAgent;

  protected readonly configWrapper: HermesConfigWrapper;

  constructor(
    tagMessages: TagMessagesParser,
    repository: TagRepository,
    agent: DiscordTagAgent,
    configWrapper: HermesConfigWrapper,
  ) {
    this.tagMessages = tagMessages;
    this.repository = repository;
    this.agent = agent;
    this.configWrapper = configWrapper;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    createData: TagCreateData,
  ): Promise<void> {
    const context = {
      user: interaction.user,
    };

    if (!interaction.replied && !interaction.deferred) {
      if (
        interaction.isCommand()
        || (interaction.isModalSubmit() && !interaction.isFromMessage())
      ) {
        await interaction.deferReply({ ephemeral: true });
      } else {
        await interaction.deferUpdate();
      }
    }

    const canDelete = this.configWrapper.canEditTags(
      interaction.member as GuildMember,
    );
    if (!canDelete) {
      const error = this.tagMessages.getNotAllowedErrorEmbed(context);

      await interaction.editReply({ embeds: [error] });
      return;
    }

    let tag;
    try {
      tag = await this.repository.create(createData);
      await this.agent.postCreateLog(context.user, tag);
    } catch (e) {
      const embeds = this.tagMessages.getCreateErrorEmbeds({
        ...context,
        error: {
          instance: e as Error,
          id: nanoid(5),
        },
      });

      await interaction.editReply({ embeds: [embeds.user], components: [] });
      await this.agent.postError(embeds.log);

      return;
    }

    const newContext = {
      ...context,
      services: { tag },
    };

    const successEmbed = this.tagMessages.getCreateSuccessEmbed(newContext);
    const tagEmbed = this.tagMessages.getInfoEmbed(newContext);

    await interaction.editReply({
      embeds: [successEmbed, tagEmbed],
      components: [],
    });
  }
}
