import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { DiscordBlacklistAgent } from '../../discord/DiscordBlacklistAgent';
import type { IdentifiableBlacklist } from '../../identity/IdentifiableBlacklist';

export interface BlacklistActionExecutor
  extends ServiceActionExecutor<DiscordBlacklistAgent, IdentifiableBlacklist> {}
