import type { RequirementConfig } from '../../hermes/requirement/config/RequirementConfigSchema';
import type { Requirement } from '../Requirement';

export interface RequirementFactory<Context, Checked> {
  create(config: RequirementConfig): Requirement<Context, Checked>;

  getId(): string;
}
