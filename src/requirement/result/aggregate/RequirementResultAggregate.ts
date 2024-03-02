import type { EmbedBuilder } from 'discord.js';
import type { OptionalInlineField } from '../../../discord/embed/OptionalInlineField';
import type { RequirementResultEnum } from '../RequirementResultEnum';

type RequirementMessageAggregate = {
  empty: boolean;
  embeds: EmbedBuilder[];
  fields: OptionalInlineField[];
};

export type RequirementResultAggregate =
  | {
      result:
        | typeof RequirementResultEnum.Allow
        | typeof RequirementResultEnum.Warn;
      warnedBy: RequirementMessageAggregate;
      deniedBy: RequirementMessageAggregate;
    }
  | {
      result: typeof RequirementResultEnum.Deny;
      warnedBy: RequirementMessageAggregate;
      deniedBy: RequirementMessageAggregate;
    };
