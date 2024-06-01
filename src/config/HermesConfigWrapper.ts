import type { HermesMember } from '../service/member/HermesMember';
import { HermesMemberTypeEnum } from '../service/member/HermesMemberType';

import type { OfferData } from '../service/offer/OfferData';
import type { RequestData } from '../service/request/RequestData';
import type { HermesConfig } from './HermesConfigSchema';

export class HermesConfigWrapper {
  protected readonly config: HermesConfig;

  constructor(config: HermesConfig) {
    this.config = config;
  }

  public canEditTags(member: HermesMember): boolean {
    return member.type !== HermesMemberTypeEnum.Mock && this.isStaff(member);
  }

  public canEditOffer(member: HermesMember, offer: OfferData): boolean {
    if (member.type === HermesMemberTypeEnum.Mock) {
      return offer.userId === member.id;
    }

    return offer.userId === member.id || this.isStaff(member);
  }

  public canEditRequest(member: HermesMember, request: RequestData): boolean {
    if (member.type === HermesMemberTypeEnum.Mock) {
      return request.userId === member.id;
    }

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
