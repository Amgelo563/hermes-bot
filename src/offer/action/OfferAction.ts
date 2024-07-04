import { z } from 'zod';

import { GeneralServiceAction } from '../../service/action/action/GeneralServiceAction';

export const OfferAction = z.enum(['Repost', ...GeneralServiceAction.options]);

export type OfferActionType = z.infer<typeof OfferAction>;

export type OfferActionOptions = typeof OfferAction.options;
