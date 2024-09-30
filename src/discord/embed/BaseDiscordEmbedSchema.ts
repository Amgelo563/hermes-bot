import { z } from 'zod';

export const BaseDiscordEmbedSchema = z
  .object({
    title: z.string().optional(),
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
  })
  .refine((embed) => {
    return !!(
      embed.title
      || embed.author
      || embed.description
      || embed.thumbnail
      || embed.image
      || embed.footer
    );
  }, 'An embed needs to have at least a title, an author, a description, a thumbnail, an image or a footer.');
