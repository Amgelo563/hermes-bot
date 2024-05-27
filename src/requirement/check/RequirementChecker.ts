import type { RequirementConfig } from '../../hermes/requirement/config/RequirementConfigSchema';
import type { RequirementFactory } from '../factory/RequirementFactory';
import type {
  RequirementCheckMode,
  RequirementCheckModeEnum,
} from '../mode/RequirementCheckMode';
import type { RequirementResultAggregate } from '../result/aggregate/RequirementResultAggregate';
import type { RequirementCheckMappings } from './RequirementCheckMappings';

export interface RequirementChecker<
  Context,
  Map extends RequirementCheckMappings,
> {
  setAvailableRequirements<const Stage extends RequirementCheckMode>(
    stage: RequirementCheckMode,
    requirements: RequirementFactory<
      Context,
      RequirementCheckMappings[Stage]
    >[],
  ): this;

  initialize(stage: RequirementCheckMode, config: RequirementConfig[]): this;

  checkPublish(
    context: Context,
    check: Map[typeof RequirementCheckModeEnum.Publish],
  ): Promise<RequirementResultAggregate>;

  check<const Stage extends RequirementCheckMode>(
    stage: Stage,
    context: Context,
    check: Map[Stage],
  ): Promise<RequirementResultAggregate>;
}
