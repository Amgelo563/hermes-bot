import type { Identifiable } from '@nyx-discord/core';

import type { BlacklistData } from '../data/BlacklistData';

export interface IdentifiableBlacklist
  extends Identifiable<string>,
    BlacklistData {}

export function createIdentifiableBlacklist(
  blacklist: BlacklistData,
): IdentifiableBlacklist {
  return {
    ...blacklist,
    getId(): string {
      return blacklist.id;
    },
  };
}
