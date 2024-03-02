import { z } from 'zod';
import { DiscordEmbedFieldSchema } from '../../../discord/embed/DiscordEmbedFieldSchema';
import { DiscordTemplatedEmbedSchema } from '../../../discord/embed/DiscordTemplatedEmbedSchema';

export const RequirementConfigSchema = z
  .object({
    id: z.string(),
    deny: z.boolean().default(true),
  })
  .passthrough();

export const FieldRequirementConfigSchema = RequirementConfigSchema.extend({
  message: DiscordEmbedFieldSchema,
});

export const EmbedRequirementConfigSchema = RequirementConfigSchema.extend({
  message: DiscordTemplatedEmbedSchema,
});

export type RequirementConfig = z.infer<typeof RequirementConfigSchema>;

export type FieldRequirementConfig = z.infer<
  typeof FieldRequirementConfigSchema
>;

export type EmbedRequirementConfig = z.infer<
  typeof EmbedRequirementConfigSchema
>;
