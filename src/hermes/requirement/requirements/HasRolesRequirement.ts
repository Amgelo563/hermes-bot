import type { GuildMember } from 'discord.js';
import type { z } from 'zod';
import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../requirement/result/RequirementResultEnum';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../AbstractHermesRequirement';
import type { HasRolesConfig } from '../factories/HasRolesRequirementFactory';
import { HasRolesMode } from '../factories/HasRolesRequirementFactory';

export class HasRolesRequirement<Data> extends AbstractHermesRequirement<
  HasRolesConfig,
  Data
> {
  protected readonly memberGetter: (data: Data) => GuildMember;

  protected readonly isStaff: (member: GuildMember) => boolean;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    config: HasRolesConfig,
    memberGetter: (data: Data) => GuildMember,
    isStaff: (member: GuildMember) => boolean,
  ) {
    super(parser, config);
    this.memberGetter = memberGetter;
    this.isStaff = isStaff;
  }

  public check(
    context: HermesPlaceholderContext,
    data: Data,
  ): RequirementResultData {
    let allowed: boolean = true;
    const member = this.memberGetter(data);

    const bypassed = this.isStaff(member);
    if (bypassed) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    const hasNoRoles = member.roles.cache.size === 0;
    const config = this.config;

    switch (config.mode) {
      case HasRolesMode.only:
        if (config.roles.includes('no-roles')) {
          return {
            allowed: hasNoRoles ? RequirementResultEnum.Allow : this.reject(),
            message: this.parser.parseEmbedField(config.message, context),
          };
        }

        allowed =
          config.roles.sort().join(' ')
          === member.roles.cache
            .map((role) => role.id)
            .sort()
            .join(' ');
        break;

      case HasRolesMode.any:
        if (config.roles.includes('no-roles')) {
          return {
            allowed: hasNoRoles ? RequirementResultEnum.Allow : this.reject(),
            message: this.parser.parseEmbedField(config.message, context),
          };
        }

        allowed = config.roles.some((role) => member.roles.cache.has(role));
        break;
      case HasRolesMode.all:
        allowed = config.roles.every((role) => member.roles.cache.has(role));
        break;
      case HasRolesMode.none:
        if (config.roles.includes('no-roles')) {
          return {
            allowed: hasNoRoles ? this.reject() : RequirementResultEnum.Allow,
            message: this.parser.parseEmbedField(config.message, context),
          };
        }

        allowed = !config.roles.some((role) => member.roles.cache.has(role));
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
