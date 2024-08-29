import type { HermesMemberType } from './HermesMemberType';

export interface HermesMember {
  id: string;

  username: string;
  discriminator: string;
  globalName: string | null;
  avatar: string;
  tag: string;

  roles: string[];
  roleNames: string[];

  type: HermesMemberType;
}
