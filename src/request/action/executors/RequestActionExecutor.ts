import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { IdentifiableRequest } from '../identity/IdentifiableRequest';

export interface RequestActionExecutor
  extends ServiceActionExecutor<IdentifiableRequest> {}
