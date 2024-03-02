import type { RequestSessionData } from '../../../bot/request/sessions/RequestSessionData';
import type { HermesRequirement } from '../../../hermes/requirement/HermesRequirement';

export interface RequestSessionRequirement
  extends HermesRequirement<RequestSessionData> {}
