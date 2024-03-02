import type { SubCommandData } from '@nyx-discord/core';
import type { ConfigCommandOption } from '../../../hermes/message/command/ConfigCommandOptionSchema';
import { TagAction } from '../../../tag/action/TagAction';
import type { TagMessagesParser } from '../../../tag/message/TagMessagesParser';
import { TagActionSubCommand } from './TagActionSubCommand';

export class TagsInfoSubCommand extends TagActionSubCommand {
  protected readonly action = TagAction.enum.Info;

  protected getTagOption(messages: TagMessagesParser): ConfigCommandOption {
    return messages.getInfoCommandData().options.tag;
  }

  protected getCommandData(messages: TagMessagesParser): SubCommandData {
    return messages.getInfoCommandData();
  }
}
