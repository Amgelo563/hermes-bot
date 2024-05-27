import type { HermesRequirementFactory } from '../../../hermes/requirement/HermesRequirementFactory';
import type { RequirementCheckModeEnum } from '../../../requirement/mode/RequirementCheckMode';
import type { RequestRequirementsMap } from '../RequestRequirementsMap';

export interface RequestRepostRequirementFactory
  extends HermesRequirementFactory<
    RequestRequirementsMap[typeof RequirementCheckModeEnum.Repost]
  > {}
