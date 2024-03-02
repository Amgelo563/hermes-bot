import type { Identifiable } from '@nyx-discord/core';
import type { RequestData } from '../../../service/request/RequestData';

export interface IdentifiableRequest
  extends Identifiable<string>,
    RequestData {}

export function createIdentifiableRequest(
  requestData: RequestData,
): IdentifiableRequest {
  return {
    ...requestData,
    getId(): string {
      return requestData.id.toString();
    },
  };
}
