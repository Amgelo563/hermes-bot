import type { Awaitable } from 'discord.js';
import type { z } from 'zod';

import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../requirement/result/RequirementResultEnum';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../AbstractHermesRequirement';
import type { HasRolesConfig } from '../factories/HasRolesRequirementFactory';
import { HasRolesMode } from '../factories/HasRolesRequirementFactory';

export class HasRolesRequirement<Data> extends AbstractHermesRequirement<
  HasRolesConfig,
  Data
> {
  protected readonly memberGetter: (data: Data) => HermesMember;

  protected readonly isStaff: (member: HermesMember) => Awaitable<boolean>;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    config: HasRolesConfig,
    memberGetter: (data: Data) => HermesMember,
    isStaff: (member: HermesMember) => Awaitable<boolean>,
  ) {
    super(parser, config);
    this.memberGetter = memberGetter;
    this.isStaff = isStaff;
  }

  public async check(
    context: HermesPlaceholderContext,
    data: Data,
  ): Promise<RequirementResultData> {
    let allowed: boolean = true;
    const member = this.memberGetter(data);
    const bypassed = await this.isStaff(member);
    if (bypassed) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    const hasNoRoles = member.roles.length === 0;
    const config = this.config;

    switch (config.mode) {
      case HasRolesMode.only:
        if (config.roles.includes('no-roles')) {
          return {
            allowed: hasNoRoles ? RequirementResultEnum.Allow : this.reject(),
            message: this.parser.parseEmbedField(config.message, context),
          };
        }
        if (config.roles.includes('has-roles')) {
          return {
            allowed: hasNoRoles ? this.reject() : RequirementResultEnum.Allow,
            message: this.parser.parseEmbedField(config.message, context),
          };
        }

        allowed =
          config.roles.sort().join(' ') === member.roles.sort().join(' ');
        break;

      case HasRolesMode.any:
        if (config.roles.includes('no-roles')) {
          return {
            allowed: hasNoRoles ? RequirementResultEnum.Allow : this.reject(),
            message: this.parser.parseEmbedField(config.message, context),
          };
        }
        if (config.roles.includes('has-roles')) {
          return {
            allowed: hasNoRoles ? this.reject() : RequirementResultEnum.Allow,
            message: this.parser.parseEmbedField(config.message, context),
          };
        }

        allowed = config.roles.some((role) => member.roles.includes(role));
        break;
      case HasRolesMode.all:
        allowed = config.roles.every((role) => member.roles.includes(role));
        break;
      case HasRolesMode.none:
        if (config.roles.includes('no-roles')) {
          return {
            allowed: hasNoRoles ? this.reject() : RequirementResultEnum.Allow,
            message: this.parser.parseEmbedField(config.message, context),
          };
        }

        allowed = !config.roles.some((role) => member.roles.includes(role));
        break;
    }

    if (allowed) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    return {
      allowed: this.reject(),
      message: this.parser.parseEmbedField(config.message, context),
    };
  }
}
