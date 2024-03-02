import type { OfferData } from '../offer/OfferData';
import type { RequestData } from '../request/RequestData';
import type { TagData } from './TagData';

export type TagDataWithConnections = TagData & {
  requests: RequestData[];
  offers: OfferData[];
};
