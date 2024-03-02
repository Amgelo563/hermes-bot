import { z } from 'zod';
import { GeneralServiceAction } from '../../service/action/action/GeneralServiceAction';

export const RequestAction = z.enum([
  'Repost',
  ...GeneralServiceAction.options,
]);

export type RequestActionType = z.infer<typeof RequestAction>;

export type RequestActionOptions = typeof RequestAction.options;
