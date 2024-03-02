import { z } from 'zod';

export const ServiceObject = z.enum(['Request', 'Offer', 'Tag'] as const);

export type ServiceObjectType = z.infer<typeof ServiceObject>;
