import type { BlacklistPlaceholderData } from '../../../blacklist/message/placeholder/BlacklistPlaceholderData';
import type { OfferDataWithMember } from '../../../offer/data/OfferDataWithMember';
import type { RequestDataWithMember } from '../../../request/data/RequestDataWithMember';
import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagData } from '../../../tag/data/TagData';

export type HermesPlaceholderContext<Updated = object> = {
  member: HermesMember;

  services?: {
    offer?: OfferDataWithMember;
    request?: RequestDataWithMember;
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

  blacklist?: BlacklistPlaceholderData;
};
