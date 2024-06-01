import type { HermesMember } from '../../member/HermesMember';
import type { ServiceActionInteraction } from '../interaction/ServiceActionInteraction';

export interface ServiceActionExecutor<Of> {
  execute(
    interaction: ServiceActionInteraction,
    invoker: HermesMember,
    object: Of,
  ): Promise<void>;
}
