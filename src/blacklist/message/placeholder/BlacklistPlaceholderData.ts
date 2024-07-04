import type { HermesMember } from '../../../service/member/HermesMember';
import type { BlacklistData } from '../../data/BlacklistData';

export type BlacklistPlaceholderData = BlacklistData & {
  blacklisted: HermesMember;
  blacklister: HermesMember;
};
