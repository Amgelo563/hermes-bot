import type { HermesMember } from '../../service/member/HermesMember';
import type { OfferData } from './OfferData';

export type OfferDataWithMember = OfferData & { member: HermesMember };
