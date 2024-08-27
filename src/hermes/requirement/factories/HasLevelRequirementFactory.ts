import { z } from 'zod';

import type { HermesMember } from '../../../service/member/HermesMember';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import { AbstractHermesRequirementFactory } from '../AbstractHermesRequirementFactory';
import {
  FieldRequirementConfigSchema,
  type RequirementConfig,
} from '../config/RequirementConfigSchema';
import type { HermesRequirement } from '../HermesRequirement';
import { HasLevelRequirement } from '../requirements/HasLevelRequirement';

const HasLevelConfigSchema = FieldRequirementConfigSchema.extend({
  regex: z.string().transform((string) => {
    return new RegExp(string);
  }),
  level: z.number(),
  staffBypass: z.boolean().optional().default(true),
});

export type HasLevelConfig = z.infer<typeof HasLevelConfigSchema>;

export class HasLevelRequirementFactory<
  Data,
> extends AbstractHermesRequirementFactory<Data> {
  protected readonly memberGetter: (data: Data) => HermesMember;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    memberGetter: (data: Data) => HermesMember,
  ) {
    super(parser);
    this.memberGetter = memberGetter;
  }

  public create(config: RequirementConfig): HermesRequirement<Data> {
    const parsed = HasLevelConfigSchema.parse(config);
    return new HasLevelRequirement(this.parser, parsed, this.memberGetter);
  }

  public getId() {
    return 'has-level';
  }
}
