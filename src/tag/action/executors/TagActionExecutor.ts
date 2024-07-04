import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { TagData } from '../../data/TagData';
import type { DiscordTagAgent } from '../../discord/DiscordTagAgent';

export interface TagActionExecutor
  extends ServiceActionExecutor<DiscordTagAgent, TagData> {}
