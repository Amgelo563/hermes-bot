import type { z } from 'zod';

import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../requirement/result/RequirementResultEnum';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../AbstractHermesRequirement';
import type { HasLevelConfig } from '../factories/HasLevelRequirementFactory';

export class HasLevelRequirement<Data> extends AbstractHermesRequirement<
  HasLevelConfig,
  Data
> {
  protected readonly memberGetter: (data: Data) => HermesMember;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    config: HasLevelConfig,
    memberGetter: (data: Data) => HermesMember,
  ) {
    super(parser, config);
    this.memberGetter = memberGetter;
  }

  public check(
    context: HermesPlaceholderContext,
    data: Data,
  ): RequirementResultData {
    const levelMatches: number[] = [];
    const member = this.memberGetter(data);

    const hasBypassRole =
      (this.config.rolesBypass ?? []).filter((role) =>
        member.roles.includes(role),
      ).length > 0;
    if (hasBypassRole) return { allowed: RequirementResultEnum.Allow };

    for (const role of member.roleNames) {
      const { level: levelString } = this.config.regex.exec(role)?.groups ?? {};
      if (!levelString) continue;

      const level = Number(levelString);
      if (Number.isNaN(level)) continue;

      levelMatches.push(level);
    }

    if (!levelMatches.length) {
      return {
        allowed: this.reject(),
        message: this.parser.parseEmbedField(this.config.message, context),
      };
    }

    const maxLevel = Math.max(...levelMatches);

    return {
      allowed:
        maxLevel >= this.config.level
          ? RequirementResultEnum.Allow
          : this.reject(),
      message: this.parser.parseEmbedField(this.config.message, context),
    };
  }
}
