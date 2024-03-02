import { z } from 'zod';

export const ConfigTagSchema = z.object({
  name: z.string(),
  color: z.string(),
  description: z.string(),
});
