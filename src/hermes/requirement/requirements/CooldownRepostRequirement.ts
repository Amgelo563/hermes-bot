import { IllegalStateError } from '@nyx-discord/core';
import type { Collection, GuildMember } from 'discord.js';
import { time, TimestampStyles } from 'discord.js';
import type { z } from 'zod';

import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../requirement/result/RequirementResultEnum';
import type { ServiceActionInteraction } from '../../../service/action/interaction/ServiceActionInteraction';
import type { BasicHermesMessageParser } from '../../message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../AbstractHermesRequirement';
import type { CooldownRequirementConfig } from '../factories/CooldownRepostRequirementFactory';

export class CooldownRepostRequirement extends AbstractHermesRequirement<
  CooldownRequirementConfig,
  {
    interaction: ServiceActionInteraction;
    repost: { lastPostedAt: Date };
  }
> {
  protected roleCooldowns: Collection<string, number> | null = null;

  protected defaultCooldown: number | null = null;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    config: CooldownRequirementConfig,
    roleCooldowns: Collection<string, number> | null,
    defaultCooldown: number | null,
  ) {
    super(parser, config);

    this.roleCooldowns = roleCooldowns;
    this.defaultCooldown = defaultCooldown;
  }

  public getId(): string {
    return 'cooldown';
  }

  public check(
    context: HermesPlaceholderContext,
    checked: {
      interaction: ServiceActionInteraction;
      repost: { lastPostedAt: Date };
    },
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
      allowed: allowed ? RequirementResultEnum.Allow : this.reject(),
      message: this.parser.parseEmbedField(
        this.config.message,
        context,
        undefined,
        {
          timeLeft: time(
            Math.round(cooldownExpiration / 1000),
            TimestampStyles.RelativeTime,
          ),
        },
      ),
    };
  }
}
