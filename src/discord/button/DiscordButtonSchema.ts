import { ButtonStyle } from 'discord.js';
import { z } from 'zod';
import { BaseDiscordButtonSchema } from './BaseDiscordButtonSchema';

type ButtonStyleKeys = keyof typeof ButtonStyle;

const styleKeys = Object.keys(ButtonStyle) as [
  ButtonStyleKeys,
  ...ButtonStyleKeys[],
];

export const DiscordButtonSchema = BaseDiscordButtonSchema.extend({
  style: z
    .enum(styleKeys)
    .transform((style) => ButtonStyle[style])
    .refine(
      (style): style is Exclude<ButtonStyle, ButtonStyle.Link> =>
        style !== ButtonStyle.Link,
    ),
});
