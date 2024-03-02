import { TimestampStyles } from '@discordjs/formatters';
import { AssertionError, IllegalStateError } from '@nyx-discord/core';
import type { GuildMember } from 'discord.js';
import { Collection, time } from 'discord.js';
import parseDuration from 'parse-duration';
import { z } from 'zod';

import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../requirement/result/RequirementResultEnum';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../AbstractHermesRequirement';
import type { RequirementConfig } from '../config/RequirementConfigSchema';
import { FieldRequirementConfigSchema } from '../config/RequirementConfigSchema';

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

type CooldownRequirementConfig = z.infer<
  typeof CooldownRequirementConfigSchema
>;

export class CooldownRepostRequirement extends AbstractHermesRequirement<
  CooldownRequirementConfig,
  {
    interaction: ServiceActionInteraction;
    repost: { lastPostedAt: Date };
  }
> {
  protected roleCooldowns: Collection<string, number> | null = null;

  protected defaultCooldown: number | null = null;

  public getId(): string {
    return 'cooldown';
  }

  protected parseConfig(config: RequirementConfig): CooldownRequirementConfig {
    const parsed = CooldownRequirementConfigSchema.parse(config);

    const defaultDuration = parseDuration(parsed.cooldown);
    if (!defaultDuration) {
      throw new AssertionError(
        `Invalid default cooldown duration: ${parsed.cooldown}`,
      );
    }
    this.defaultCooldown = defaultDuration;

    if (!parsed.overrides) return parsed;
    const roleCooldowns = new Collection<string, number>();

    for (const override of parsed.overrides) {
      const roleDuration = parseDuration(override.cooldown);
      if (!roleDuration) {
        throw new AssertionError(
          `Invalid cooldown duration '${override.cooldown}' for role '${override.role}'`,
        );
      }
      roleCooldowns.set(override.role, roleDuration);
    }

    this.roleCooldowns = roleCooldowns;

    return parsed;
  }

  protected performCheck(
    context: HermesPlaceholderContext,
    checked: {
      interaction: ServiceActionInteraction;
      repost: { lastPostedAt: Date };
    },
    config: CooldownRequirementConfig,
  ): RequirementResultData {
    const defaultCooldown = this.defaultCooldown;
    if (!defaultCooldown) {
      throw new IllegalStateError();
    }

    const member = checked.interaction.member as GuildMember;
    const cooldown = this.roleCooldowns
      ? this.roleCooldowns
          .filter((_cooldown, role) => member.roles.cache.has(role))
          .reduce((max, override) => Math.max(max, override), 0)
      : defaultCooldown;

    const cooldownExpiration = checked.repost.lastPostedAt.getTime() + cooldown;
    const allowed = Date.now() >= cooldownExpiration;

    return {
      allowed: allowed ? RequirementResultEnum.Allow : this.reject(config),
      message: this.parser.parseEmbedField(config.message, context, undefined, {
        timeLeft: time(
          Math.round(cooldownExpiration / 1000),
          TimestampStyles.RelativeTime,
        ),
      }),
    };
  }
}
