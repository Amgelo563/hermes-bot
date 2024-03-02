import type { HermesRequirement } from '../../../hermes/requirement/HermesRequirement';
import type { RequirementCheckModeEnum } from '../../../requirement/mode/RequirementCheckMode';
import type { OfferRequirementsMap } from '../OfferRequirementsMap';

export interface OfferRepostRequirement
  extends HermesRequirement<
    OfferRequirementsMap[typeof RequirementCheckModeEnum.Repost]
  > {}
