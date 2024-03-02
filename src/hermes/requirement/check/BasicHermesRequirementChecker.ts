import { BasicRequirementChecker } from '../../../requirement/check/BasicRequirementChecker';
import type { RequirementCheckMappings } from '../../../requirement/check/RequirementCheckMappings';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';

export class BasicHermesRequirementChecker<
  RequirementMap extends RequirementCheckMappings,
> extends BasicRequirementChecker<HermesPlaceholderContext, RequirementMap> {}
