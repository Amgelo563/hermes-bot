import type { HermesMember } from '../../../service/member/HermesMember';

import type { OfferData } from '../../../service/offer/OfferData';
import type { RequestData } from '../../../service/request/RequestData';
import type { TagData } from '../../../service/tag/TagData';

export type HermesPlaceholderContext<Updated = object> = {
  member: HermesMember;

  services?: {
    offer?: OfferData;
    request?: RequestData;
    tag?: TagData;
  };

  missingRequirement?: {
    name: string;
    description: string;
    inline?: boolean;
  };

  warningWord?: {
    word: string;
    warn: string;
  };

  error?: {
    instance: Error;
    id: string;
  };

  update?: {
    affected: HermesMember;
    updater: HermesMember;
    new: Updated;
    old: Updated;
  };
};
