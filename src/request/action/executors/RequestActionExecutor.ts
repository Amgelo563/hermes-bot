import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { DiscordRequestAgent } from '../../discord/DiscordRequestAgent';
import type { IdentifiableRequest } from '../../identity/IdentifiableRequest';

export interface RequestActionExecutor
  extends ServiceActionExecutor<DiscordRequestAgent, IdentifiableRequest> {}
