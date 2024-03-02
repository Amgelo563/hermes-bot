import { z } from 'zod';

export const GeneralServiceAction = z.enum([
  'Info',
  'Update',
  'ReqUpd',
  'Delete',
]);

export type ServiceActionType = z.infer<typeof GeneralServiceAction>;
