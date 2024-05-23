import type { GuildMember } from 'discord.js';
import { z } from 'zod';
import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../requirement/result/RequirementResultEnum';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../AbstractHermesRequirement';
import type { RequirementConfig } from '../config/RequirementConfigSchema';
import { FieldRequirementConfigSchema } from '../config/RequirementConfigSchema';

const HasRolesConfigSchema = FieldRequirementConfigSchema.extend({
  mode: z.enum(['any', 'all', 'none']),
  roles: z.array(z.string()),
  staffBypass: z.boolean().optional().default(true),
});

type HasRolesConfig = z.infer<typeof HasRolesConfigSchema>;

export class HasRolesRequirement<Data> extends AbstractHermesRequirement<
  HasRolesConfig,
  Data
> {
  protected readonly memberGetter: (data: Data) => GuildMember;

  protected readonly isStaff: (member: GuildMember) => boolean;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    memberGetter: (data: Data) => GuildMember,
    isStaff: (member: GuildMember) => boolean,
  ) {
    super(parser);
    this.memberGetter = memberGetter;
    this.isStaff = isStaff;
  }

  public getId(): string {
    return 'roles';
  }

  protected parseConfig(config: RequirementConfig): HasRolesConfig {
    return HasRolesConfigSchema.parse(config);
  }

  protected performCheck(
    context: HermesPlaceholderContext,
    data: Data,
    config: HasRolesConfig,
  ): RequirementResultData {
    let allowed: boolean = true;
    const member = this.memberGetter(data);

    const bypassed = this.isStaff(member);
    if (bypassed) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    if (member.roles.cache.size === 0) {
      return {
        allowed: config.roles.includes('no-roles')
          ? RequirementResultEnum.Allow
          : this.reject(config),
        message: this.parser.parseEmbedField(config.message, context),
      };
    }

    switch (config.mode) {
      case HasRolesConfigSchema.shape.mode.enum.any:
        allowed = config.roles.some((role) => member.roles.cache.has(role));
        break;
      case HasRolesConfigSchema.shape.mode.enum.all:
        allowed = config.roles.every((role) => member.roles.cache.has(role));
        break;
      case HasRolesConfigSchema.shape.mode.enum.none:
        allowed = !config.roles.some((role) => member.roles.cache.has(role));
        break;
    }

    if (allowed) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    return {
      allowed: this.reject(config),
      message: this.parser.parseEmbedField(config.message, context),
    };
  }
}
