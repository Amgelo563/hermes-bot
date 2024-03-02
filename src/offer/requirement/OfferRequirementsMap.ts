import type { OfferSessionData } from '../../bot/offer/sessions/OfferSessionData';
import type { RequirementCheckModeEnum } from '../../requirement/mode/RequirementCheckMode';
import type { ServiceActionInteraction } from '../../service/action/interaction/ServiceActionInteraction';
import type { OfferData } from '../../service/offer/OfferData';

export interface OfferRequirementsMap {
  [RequirementCheckModeEnum.Publish]: OfferSessionData;
  [RequirementCheckModeEnum.Repost]: {
    interaction: ServiceActionInteraction;
    repost: OfferData;
  };
  [RequirementCheckModeEnum.Update]: OfferSessionData;
}
