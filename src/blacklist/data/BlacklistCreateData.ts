import type { HermesMember } from '../../service/member/HermesMember';

export type BlacklistCreateData = {
  blacklisted: HermesMember;
  blacklister: HermesMember;
  reason: string;
  expiresAt: Date | null;
};
