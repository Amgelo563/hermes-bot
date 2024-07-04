import type { SessionStartInteraction } from '@nyx-discord/core';
import type { RequestModalInputData } from '../../../request/modal/RequestModalInputData';

import type { HermesMember } from '../../../service/member/HermesMember';
import type { TagData } from '../../../tag/data/TagData';

export type RequestSessionData = {
  request: RequestModalInputData;
  tag: TagData | null;
  interaction: SessionStartInteraction;
  member: HermesMember;
};
