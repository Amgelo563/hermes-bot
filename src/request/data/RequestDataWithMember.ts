import type { HermesMember } from '../../service/member/HermesMember';
import type { RequestData } from './RequestData';

export type RequestDataWithMember = RequestData & { member: HermesMember };
