import type { SessionStartInteraction } from '@nyx-discord/core';

import type { RequestModalInputData } from '../../../service/request/RequestModalInputData';
import type { TagData } from '../../../service/tag/TagData';

export type RequestSessionData = {
  request: RequestModalInputData;
  tag: TagData | null;
  interaction: SessionStartInteraction;
};
