import type { z } from 'zod';
import { GeneralServiceAction } from '../../service/action/action/GeneralServiceAction';

export const TagAction = GeneralServiceAction;

export type TagActionType = z.infer<typeof TagAction>;

export type TagActionOptions = typeof TagAction.options;
