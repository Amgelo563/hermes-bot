import type { DiscordServiceAgent } from '../../discord/DiscordServiceAgent';
import type { ServiceActionInteraction } from '../interaction/ServiceActionInteraction';

export interface ServiceActionExecutor<Agent extends DiscordServiceAgent, Of> {
  execute(
    interaction: ServiceActionInteraction,
    agent: Agent,
    object: Of,
  ): Promise<void>;
}
