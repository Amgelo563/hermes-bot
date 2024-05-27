import { AssertionError } from '@nyx-discord/core';
import { Collection } from 'discord.js';
import parseDuration from 'parse-duration';
import { z } from 'zod';

import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import { AbstractHermesRequirementFactory } from '../AbstractHermesRequirementFactory';
import type { RequirementConfig } from '../config/RequirementConfigSchema';
import { FieldRequirementConfigSchema } from '../config/RequirementConfigSchema';
import type { HermesRequirement } from '../HermesRequirement';
import { CooldownRepostRequirement } from '../requirements/CooldownRepostRequirement';

const CooldownRequirementConfigSchema = FieldRequirementConfigSchema.extend({
  cooldown: z.string(),
  overrides: z
    .object({
      role: z.string(),
      cooldown: z.string(),
    })
    .array()
    .optional(),
});

export type CooldownRequirementConfig = z.infer<
  typeof CooldownRequirementConfigSchema
>;

export class CooldownRepostRequirementFactory extends AbstractHermesRequirementFactory<{
  interaction: ServiceActionInteraction;
  repost: { lastPostedAt: Date };
}> {
  public create(config: RequirementConfig): HermesRequirement<{
    interaction: ServiceActionInteraction;
    repost: { lastPostedAt: Date };
  }> {
    const parsed = CooldownRequirementConfigSchema.parse(config);

    const defaultDuration = parseDuration(parsed.cooldown);
    if (!defaultDuration) {
      throw new AssertionError(
        `Invalid default cooldown duration: ${parsed.cooldown}`,
      );
    }

    let roleCooldowns: Collection<string, number> | null = null;
    if (parsed.overrides) {
      roleCooldowns = new Collection<string, number>();

      for (const override of parsed.overrides) {
        const roleDuration = parseDuration(override.cooldown);
        if (!roleDuration) {
          throw new AssertionError(
            `Invalid cooldown duration '${override.cooldown}' for role '${override.role}'`,
          );
        }
        roleCooldowns.set(override.role, roleDuration);
      }
    }

    return new CooldownRepostRequirement(
      this.parser,
      parsed,
      roleCooldowns,
      defaultDuration,
    );
  }

  public getId(): string {
    return 'cooldown';
  }
}
