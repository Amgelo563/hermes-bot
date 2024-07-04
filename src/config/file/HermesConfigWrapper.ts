import { GuildMember } from 'discord.js';
import type { OfferData } from '../../offer/data/OfferData';
import type { RequestData } from '../../request/data/RequestData';
import type { HermesMember } from '../../service/member/HermesMember';
import { HermesMemberTypeEnum } from '../../service/member/HermesMemberType';
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
      return offer.memberId === member.id;
    }

    return offer.memberId === member.id || this.isStaff(member);
  }

  public canEditRequest(member: HermesMember, request: RequestData): boolean {
    if (member.type === HermesMemberTypeEnum.Mock) {
      return request.memberId === member.id;
    }

    return request.memberId === member.id || this.isStaff(member);
  }

  public isStaff(member: HermesMember | GuildMember): boolean {
    if (member instanceof GuildMember) {
      return this.config.discord.staffRoles.some((role) =>
        member.roles.cache.has(role),
      );
    }

    if (member.type !== HermesMemberTypeEnum.Real) {
      return false;
    }

    return this.config.discord.staffRoles.some((role) =>
      member.roles.includes(role),
    );
  }

  public getConfig(): HermesConfig {
    return this.config;
  }
}
