import type { RequestSessionData } from '../../../bot/request/sessions/RequestSessionData';
import type { HermesRequirementFactory } from '../../../hermes/requirement/HermesRequirementFactory';

export interface RequestSessionRequirementFactory
  extends HermesRequirementFactory<RequestSessionData> {}
