import type {
  NyxBot,
  SessionStartInteraction,
  SessionUpdateInteraction,
} from '@nyx-discord/core';
import { SessionExpiredCode } from '@nyx-discord/core';
import { AbstractListPaginationSession } from '@nyx-discord/framework';
import { nanoid } from 'nanoid';

import type { BlacklistData } from '../../../blacklist/data/BlacklistData';
import type { DiscordBlacklistAgent } from '../../../blacklist/discord/DiscordBlacklistAgent';
import type { BlacklistPlaceholderData } from '../../../blacklist/message/placeholder/BlacklistPlaceholderData';
import type { BlacklistMessagesParser } from '../../../blacklist/message/read/BlacklistMessagesParser';
import type { GeneralMessagesParser } from '../../../hermes/message/messages/general/GeneralMessagesParser';
import type { HermesMember } from '../../../service/member/HermesMember';

export class BlacklistListSession extends AbstractListPaginationSession<
  BlacklistData,
  void
> {
  protected readonly blacklistMessages: BlacklistMessagesParser;

  protected readonly generalMessages: GeneralMessagesParser;

  protected readonly startMember: HermesMember;

  protected readonly agent: DiscordBlacklistAgent;

  constructor(
    bot: NyxBot,
    startInteraction: SessionStartInteraction,
    blacklists: BlacklistData[],
    startMember: HermesMember,
    blacklistMessages: BlacklistMessagesParser,
    generalMessages: GeneralMessagesParser,
    agent: DiscordBlacklistAgent,
  ) {
    super(bot, nanoid(8), startInteraction, blacklists);
    this.blacklistMessages = blacklistMessages;
    this.startMember = startMember;
    this.generalMessages = generalMessages;
    this.agent = agent;
  }

  public async start(): Promise<void> {
    const data = await this.getCurrentPageData();
    await this.startInteraction.editReply(data);
  }

  public async onEnd(code: string | number | symbol): Promise<void> {
    if (code !== SessionExpiredCode) {
      return;
    }

    const endEmbed = this.generalMessages.getCancelledEmbed({
      member: this.startMember,
    });
    await this.startInteraction.editReply({
      components: [],
      embeds: [endEmbed],
    });
  }

  protected async updatePage(
    interaction: SessionUpdateInteraction,
  ): Promise<boolean> {
    const data = await this.getCurrentPageData();
    await interaction.update(data);
    return true;
  }

  protected async getCurrentPageData() {
    const blacklistDatas = this.getCurrentPageItems();
    const blacklistPromises: Promise<BlacklistPlaceholderData>[] =
      blacklistDatas.map(async (blacklist) => {
        const blacklister =
          (await this.agent.fetchMember(blacklist.createdBy))
          ?? this.agent.getUnknownMember(blacklist.createdBy);
        const blacklisted =
          (await this.agent.fetchMember(blacklist.id))
          ?? this.agent.getUnknownMember(blacklist.createdBy);
        return {
          ...blacklist,
          blacklisted,
          blacklister,
        };
      });

    const blacklists = await Promise.all(blacklistPromises);

    const embed = this.blacklistMessages.getListEmbed(
      { member: this.startMember },
      blacklists,
    );
    const buttonRow = this.buildDefaultPageRow();

    return { embeds: [embed], components: [buttonRow] };
  }
}
