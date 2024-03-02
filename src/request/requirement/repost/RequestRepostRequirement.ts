import type { HermesRequirement } from '../../../hermes/requirement/HermesRequirement';
import type { RequirementCheckModeEnum } from '../../../requirement/mode/RequirementCheckMode';
import type { RequestRequirementsMap } from '../RequestRequirementsMap';

export interface RequestRepostRequirement
  extends HermesRequirement<
    RequestRequirementsMap[typeof RequirementCheckModeEnum.Repost]
  > {}
