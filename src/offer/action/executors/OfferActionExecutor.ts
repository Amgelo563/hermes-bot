import type { ServiceActionExecutor } from '../../../service/action/executor/ServiceActionExecutor';
import type { DiscordOfferAgent } from '../../discord/DiscordOfferAgent';
import type { IdentifiableOffer } from '../../identity/IdentifiableOffer';

export interface OfferActionExecutor
  extends ServiceActionExecutor<DiscordOfferAgent, IdentifiableOffer> {}
