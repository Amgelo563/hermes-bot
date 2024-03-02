import { z } from 'zod';

export const BaseDiscordEmbedSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  timestamp: z.string().optional(),
  color: z.string().optional(),
  footer: z
    .object({
      text: z.string(),
      icon: z.string().optional(),
    })
    .optional(),
  image: z.string().optional(),
  thumbnail: z.string().optional(),
  author: z
    .object({
      name: z.string(),
      url: z.string().optional(),
      icon: z.string().optional(),
    })
    .optional(),
});
