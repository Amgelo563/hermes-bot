import { z } from 'zod';

export const EscapeMarkdownConfigSchema = z.object({
  bold: z.boolean(),
  bulletedList: z.boolean(),
  codeBlock: z.boolean(),
  codeBlockContent: z.boolean(),
  escape: z.boolean(),
  heading: z.boolean(),
  inlineCode: z.boolean(),
  inlineCodeContent: z.boolean(),
  italic: z.boolean(),
  maskedLink: z.boolean(),
  numberedList: z.boolean(),
  spoiler: z.boolean(),
  strikethrough: z.boolean(),
  underline: z.boolean(),
});

export type EscapeMarkdownConfig = z.infer<typeof EscapeMarkdownConfigSchema>;
