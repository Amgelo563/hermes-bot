import type { RequestSessionData } from '../../bot/request/sessions/RequestSessionData';
import type { RequirementCheckModeEnum } from '../../requirement/mode/RequirementCheckMode';
import type { ServiceActionInteraction } from '../../service/action/interaction/ServiceActionInteraction';
import type { RequestData } from '../../service/request/RequestData';

export interface RequestRequirementsMap {
  [RequirementCheckModeEnum.Publish]: RequestSessionData;
  [RequirementCheckModeEnum.Repost]: {
    interaction: ServiceActionInteraction;
    repost: RequestData;
  };
  [RequirementCheckModeEnum.Update]: RequestSessionData;
}
