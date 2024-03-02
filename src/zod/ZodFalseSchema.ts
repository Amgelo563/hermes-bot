import { z } from 'zod';

export const ZodFalseSchema = z
  .boolean()
  .refine((value): value is false => !value, {
    message: 'Must be false',
  });
