import { nanoid } from 'nanoid';

import type { HermesConfigWrapper } from '../../../config/file/HermesConfigWrapper';
import { deferReplyOrUpdate } from '../../../discord/reply/InteractionReplies';
import type { HermesErrorAgent } from '../../../error/HermesErrorAgent';
import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { TagCreateData } from '../../data/TagCreateData';
import type { TagRepository } from '../../database/TagRepository';
import type { DiscordTagAgent } from '../../discord/DiscordTagAgent';
import type { TagMessagesParser } from '../../message/TagMessagesParser';

export class TagCreateExecutor
  implements ServiceActionExecutor<DiscordTagAgent, TagCreateData>
{
  protected readonly tagMessages: TagMessagesParser;

  protected readonly repository: TagRepository;

  protected readonly configWrapper: HermesConfigWrapper;

  protected readonly errorAgent: HermesErrorAgent;

  constructor(
    tagMessages: TagMessagesParser,
    repository: TagRepository,
    configWrapper: HermesConfigWrapper,
    errorAgent: HermesErrorAgent,
  ) {
    this.tagMessages = tagMessages;
    this.repository = repository;
    this.configWrapper = configWrapper;
    this.errorAgent = errorAgent;
  }

  public async execute(
    interaction: ServiceActionInteraction,
    agent: DiscordTagAgent,
    createData: TagCreateData,
  ): Promise<void> {
    await deferReplyOrUpdate(interaction);

    const member = await agent.fetchMemberFromInteraction(interaction);
    const context = {
      member,
    };

    const canDelete = this.configWrapper.canEditTags(member);
    if (!canDelete) {
      const error = this.tagMessages.getNotAllowedErrorEmbed(context);

      await interaction.editReply({ embeds: [error], components: [] });
      return;
    }

    let tag;
    try {
      tag = await this.repository.create(createData);
      await agent.postCreateLog(member, tag);
    } catch (e) {
      const errorEmbeds = this.tagMessages.getCreateErrorEmbeds({
        ...context,
        error: {
          instance: e as Error,
          id: nanoid(5),
        },
      });

      await this.errorAgent.consumeWithErrorEmbeds(
        e as object,
        errorEmbeds,
        interaction,
      );

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
