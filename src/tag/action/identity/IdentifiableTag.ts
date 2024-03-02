import type { Identifiable } from '@nyx-discord/core';
import type { TagData } from '../../../service/tag/TagData';

export interface IdentifiableTag extends Identifiable<string>, TagData {}

export function createIdentifiableTag(data: TagData): IdentifiableTag {
  return {
    ...data,
    getId(): string {
      return data.id.toString();
    },
  };
}
