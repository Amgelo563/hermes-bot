import type { OfferSessionData } from '../../bot/offer/sessions/OfferSessionData';
import type { RequirementCheckModeEnum } from '../../requirement/mode/RequirementCheckMode';
import type { ServiceActionInteraction } from '../../service/action/interaction/ServiceActionInteraction';
import type { HermesMember } from '../../service/member/HermesMember';
import type { OfferData } from '../../service/offer/OfferData';

export interface OfferRequirementsMap {
  [RequirementCheckModeEnum.Publish]: OfferSessionData;
  [RequirementCheckModeEnum.Repost]: {
    interaction: ServiceActionInteraction;
    repost: OfferData;
    member: HermesMember;
  };
  [RequirementCheckModeEnum.Update]: OfferSessionData;
}
