import type {
  CommandData,
  CommandExecutionArgs,
  ExecutableCommand,
  MiddlewareResponse,
  Priority,
} from '@nyx-discord/core';
import { ObjectNotFoundError, PriorityEnum } from '@nyx-discord/core';
import { AbstractCommandMiddleware } from '@nyx-discord/framework';
import type { GeneralMessagesParser } from '../../hermes/message/general/GeneralMessagesParser';
import type { HermesMember } from '../../service/member/HermesMember';
import { HermesMemberTypeEnum } from '../../service/member/HermesMemberType';
import { AbstractActionSubCommand } from '../action/AbstractActionSubCommand';
import { HermesMemberFetchCommandMiddleware } from './HermesMemberFetchCommandMiddleware';

export class UserNotInGuildActionCommandMiddleware extends AbstractCommandMiddleware {
  protected readonly generalMessages: GeneralMessagesParser;

  protected readonly priority: Priority = PriorityEnum.Low;

  constructor(generalMessages: GeneralMessagesParser) {
    super();
    this.generalMessages = generalMessages;
  }

  public async check(
    checked: ExecutableCommand<CommandData>,
    [interaction, meta]: CommandExecutionArgs,
  ): Promise<MiddlewareResponse> {
    if (
      interaction.isAutocomplete()
      || interaction.inGuild()
      || !(checked instanceof AbstractActionSubCommand)
      || checked.allowsNotInGuild()
    ) {
      return this.true();
    }

    const member = meta.get(HermesMemberFetchCommandMiddleware.Key) as
      | HermesMember
      | undefined;
    if (!member) {
      throw new ObjectNotFoundError();
    }
    if (member.type !== HermesMemberTypeEnum.Mock) {
      return this.true();
    }

    const context = {
      member,
    };

    const error = this.generalMessages.getNotInGuildErrorEmbed(context);
    await interaction.reply({ embeds: [error], ephemeral: true });

    return this.false();
  }
}
