import type { HermesMember } from '../service/member/HermesMember';

import type { OfferData } from '../service/offer/OfferData';
import type { RequestData } from '../service/request/RequestData';
import type { HermesConfig } from './HermesConfigSchema';

export class HermesConfigWrapper {
  protected readonly config: HermesConfig;

  constructor(config: HermesConfig) {
    this.config = config;
  }

  public canEditTags(member: HermesMember): boolean {
    return this.isStaff(member);
  }

  public canEditOffer(member: HermesMember, offer: OfferData): boolean {
    return offer.userId === member.id || this.isStaff(member);
  }

  public canEditRequest(member: HermesMember, request: RequestData): boolean {
    return request.userId === member.id || this.isStaff(member);
  }

  public isStaff(member: HermesMember): boolean {
    return this.config.discord.staffRoles.some((role) =>
      member.roles.includes(role),
    );
  }

  public getConfig(): HermesConfig {
    return this.config;
  }
}
