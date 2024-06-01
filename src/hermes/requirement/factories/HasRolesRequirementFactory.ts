import type { Awaitable } from 'discord.js';
import { z } from 'zod';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import { AbstractHermesRequirementFactory } from '../AbstractHermesRequirementFactory';
import type { RequirementConfig } from '../config/RequirementConfigSchema';
import { FieldRequirementConfigSchema } from '../config/RequirementConfigSchema';
import type { HermesRequirement } from '../HermesRequirement';
import { HasRolesRequirement } from '../requirements/HasRolesRequirement';

const HasRolesConfigSchema = FieldRequirementConfigSchema.extend({
  mode: z.enum(['any', 'all', 'none', 'only']),
  roles: z.array(z.string()),
  staffBypass: z.boolean().optional().default(true),
});

export const HasRolesMode = HasRolesConfigSchema.shape.mode.enum;

export type HasRolesConfig = z.infer<typeof HasRolesConfigSchema>;

export class HasRolesRequirementFactory<
  Data,
> extends AbstractHermesRequirementFactory<Data> {
  protected readonly memberGetter: (data: Data) => HermesMember;

  protected readonly isStaff: (member: HermesMember) => Awaitable<boolean>;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    memberGetter: (data: Data) => HermesMember,
    isStaff: (member: HermesMember) => Awaitable<boolean>,
  ) {
    super(parser);
    this.memberGetter = memberGetter;
    this.isStaff = isStaff;
  }

  public getId(): string {
    return 'has-roles';
  }

  public create(config: RequirementConfig): HermesRequirement<Data> {
    const parsed = HasRolesConfigSchema.parse(config);
    return new HasRolesRequirement(
      this.parser,
      parsed,
      this.memberGetter,
      this.isStaff,
    );
  }
}
