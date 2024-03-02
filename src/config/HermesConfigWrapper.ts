import type { GuildMember } from 'discord.js';

import type { OfferData } from '../service/offer/OfferData';
import type { RequestData } from '../service/request/RequestData';
import type { HermesConfig } from './HermesConfigSchema';

export class HermesConfigWrapper {
  protected readonly config: HermesConfig;

  constructor(config: HermesConfig) {
    this.config = config;
  }

  public canEditTags(member: GuildMember): boolean {
    return this.isStaff(member);
  }

  public canEditOffer(member: GuildMember, offer: OfferData): boolean {
    return offer.userId === member.id || this.isStaff(member);
  }

  public canEditRequest(member: GuildMember, request: RequestData): boolean {
    return request.userId === member.id || this.isStaff(member);
  }

  public getConfig(): HermesConfig {
    return this.config;
  }

  protected isStaff(member: GuildMember): boolean {
    return this.config.discord.staffRoles.some((role) =>
      member.roles.cache.has(role),
    );
  }
}
