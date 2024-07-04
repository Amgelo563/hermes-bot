import { z } from 'zod';

export const ServiceObject = z.enum([
  'Request',
  'Offer',
  'Tag',
  'Blacklist',
] as const);

export type ServiceObjectType = z.infer<typeof ServiceObject>;
