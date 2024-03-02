import type { ServiceActionInteraction } from '../interaction/ServiceActionInteraction';

export interface ServiceActionExecutor<Of> {
  execute(interaction: ServiceActionInteraction, object: Of): Promise<void>;
}
