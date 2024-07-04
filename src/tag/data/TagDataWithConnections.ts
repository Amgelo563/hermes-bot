import type { OfferData } from '../../offer/data/OfferData';
import type { RequestData } from '../../request/data/RequestData';
import type { TagData } from './TagData';

export type TagDataWithConnections = TagData & {
  requests: RequestData[];
  offers: OfferData[];
};
