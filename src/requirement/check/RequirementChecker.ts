import type { RequirementConfig } from '../../hermes/requirement/config/RequirementConfigSchema';
import type { RequirementFactory } from '../factory/RequirementFactory';
import type { RequirementCheckMode } from '../mode/RequirementCheckMode';
import type { Requirement } from '../Requirement';
import type { RequirementResultAggregate } from '../result/aggregate/RequirementResultAggregate';
import type { RequirementCheckMappings } from './RequirementCheckMappings';

export interface RequirementChecker<
  Context,
  Map extends RequirementCheckMappings,
> {
  setupFromConfigs(
    mode: RequirementCheckMode,
    config: RequirementConfig[],
  ): this;

  setSystemRequirementsForStage<const Mode extends RequirementCheckMode>(
    mode: RequirementCheckMode,
    requirements: Requirement<Context, RequirementCheckMappings[Mode]>[],
  ): this;

  setUserAvailableRequirements<const Mode extends RequirementCheckMode>(
    mode: RequirementCheckMode,
    requirements: RequirementFactory<Context, RequirementCheckMappings[Mode]>[],
  ): this;

  check<const Mode extends RequirementCheckMode>(
    mode: Mode,
    context: Context,
    check: Map[Mode],
  ): Promise<RequirementResultAggregate>;
}
