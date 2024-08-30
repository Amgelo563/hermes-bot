import type { SessionStartInteraction } from '@nyx-discord/core';
import type { GuildMember } from 'discord.js';
import type { z } from 'zod';

import type { BasicHermesMessageParser } from '../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../../hermes/requirement/AbstractHermesRequirement';
import type { OfferRepository } from '../../offer/database/OfferRepository';
import type { RequestRepository } from '../../request/database/RequestRepository';
import type { RequirementResultData } from '../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../requirement/result/RequirementResultEnum';
import type { MaxOffersRequirementConfig } from './MaxServicesRequirementFactory';

type SessionData = { interaction: SessionStartInteraction };

export class MaxServicesRequirement extends AbstractHermesRequirement<
  MaxOffersRequirementConfig,
  SessionData
> {
  protected readonly offerRepository: OfferRepository;

  protected readonly requestRepository: RequestRepository;

  constructor(
    messages: BasicHermesMessageParser<z.ZodTypeAny>,
    config: MaxOffersRequirementConfig,
    offerRepository: OfferRepository,
    requestRepository: RequestRepository,
  ) {
    super(messages, config);
    this.offerRepository = offerRepository;
    this.requestRepository = requestRepository;
  }

  public async check(
    context: HermesPlaceholderContext,
    data: SessionData,
  ): Promise<RequirementResultData> {
    const config = this.config;
    const userId = data.interaction.user.id;
    const roles = (data.interaction.member as GuildMember).roles.cache.map(
      (role) => role.id,
    );

    const max =
      config.overrides
        ?.filter((override) => roles.includes(override.role))
        .reduce((max, override) => Math.max(max, override.max), config.max)
      ?? config.max;

    let services;

    if (config.type === 'offer') {
      services = await this.offerRepository.fetchFrom(userId, max);
    } else {
      services = await this.requestRepository.fetchFrom(userId, max);
    }

    if (!services || services.length < max) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    const contexts: HermesPlaceholderContext[] = services.map((service) => {
      return {
        ...context,
        services: {
          [config.type]: service,
        },
      };
    });

    return {
      allowed: this.reject(config),
      message: this.parser.parseTemplatedEmbed(
        config.message,
        context,
        contexts,
      ),
    };
  }
}
