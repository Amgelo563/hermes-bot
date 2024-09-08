import type { Identifiable } from '@nyx-discord/core';
import type { RequestDataWithMember } from '../data/RequestDataWithMember';

export interface IdentifiableRequest
  extends Identifiable<string>,
    RequestDataWithMember {}

export function createIdentifiableRequest(
  requestData: RequestDataWithMember,
): IdentifiableRequest {
  return {
    ...requestData,
    getId(): string {
      return requestData.id.toString();
    },
  };
}
