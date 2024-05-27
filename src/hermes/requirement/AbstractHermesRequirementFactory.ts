import type { z } from 'zod';

import type { BasicHermesMessageParser } from '../message/BasicHermesMessageParser';
import type { RequirementConfig } from './config/RequirementConfigSchema';
import type { HermesRequirement } from './HermesRequirement';
import type { HermesRequirementFactory } from './HermesRequirementFactory';

export abstract class AbstractHermesRequirementFactory<Checked>
  implements HermesRequirementFactory<Checked>
{
  protected readonly parser: BasicHermesMessageParser<z.ZodTypeAny>;

  constructor(parser: BasicHermesMessageParser<z.ZodTypeAny>) {
    this.parser = parser;
  }

  public abstract create(config: RequirementConfig): HermesRequirement<Checked>;

  public abstract getId(): string;
}
