import { z } from 'zod';

export const BlacklistAction = z.enum(['Delete', 'Info']);

export type BlacklistActionType = z.infer<typeof BlacklistAction>;

export type BlacklistActionOptions = typeof BlacklistAction.options;
