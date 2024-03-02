import type { SessionStartInteraction } from '@nyx-discord/core';
import type { GuildMember } from 'discord.js';
import type { OfferSessionData } from '../../bot/offer/sessions/OfferSessionData';
import { AbstractMaxServicesRequirement } from './AbstractMaxServicesRequirement';

type SessionData = { interaction: SessionStartInteraction };

// eslint-disable-next-line max-len
export class MaxServicesEditRequirement extends AbstractMaxServicesRequirement<SessionData> {
  protected getUserId(input: SessionData): string {
    return input.interaction.user.id;
  }

  protected getRoles(input: OfferSessionData): string[] {
    return (input.interaction.member as GuildMember).roles.cache.map(
      (role) => role.id,
    );
  }
}
