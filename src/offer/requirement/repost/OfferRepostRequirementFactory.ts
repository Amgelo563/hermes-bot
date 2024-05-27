import type { HermesRequirementFactory } from '../../../hermes/requirement/HermesRequirementFactory';
import type { RequirementCheckModeEnum } from '../../../requirement/mode/RequirementCheckMode';
import type { OfferRequirementsMap } from '../OfferRequirementsMap';

export interface OfferRepostRequirementFactory
  extends HermesRequirementFactory<
    OfferRequirementsMap[typeof RequirementCheckModeEnum.Repost]
  > {}
