export const DiscordEmbedLimits = {
  Title: 256,
  /**
   * The actual limit is 4096, this is a safety net to avoid the MAX_EMBED_SIZE_EXCEEDED error
   * when posting other embeds at once.
   */
  Description: 2500,

  Author: 256,
  Footer: 2048,

  Fields: 25,
  FieldName: 256,
  FieldValue: 1024,

  Message: 10,
  Aggregate: 6000,

  ShortDescription: 1500,
} as const satisfies Record<string, number>;
