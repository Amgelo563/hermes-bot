import type { SessionStartInteraction } from '@nyx-discord/core';
import { z } from 'zod';
import type { BasicHermesMessageParser } from '../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirementFactory } from '../../hermes/requirement/AbstractHermesRequirementFactory';
import type { RequirementConfig } from '../../hermes/requirement/config/RequirementConfigSchema';
import { EmbedRequirementConfigSchema } from '../../hermes/requirement/config/RequirementConfigSchema';

import type { OfferRepository } from '../../offer/database/OfferRepository';
import type { RequestRepository } from '../../request/database/RequestRepository';
import type { Requirement } from '../../requirement/Requirement';
import { MaxServicesEditRequirement } from './MaxServicesEditRequirement';

const MaxOffersRequirementSchema = EmbedRequirementConfigSchema.extend({
  max: z.number().min(1),
  overrides: z
    .object({
      role: z.string(),
      max: z.number().min(1),
    })
    .array()
    .optional(),
  type: z.enum(['offer', 'request']),
});

export type MaxOffersRequirementConfig = z.infer<
  typeof MaxOffersRequirementSchema
>;

export class MaxServicesEditRequirementFactory extends AbstractHermesRequirementFactory<{
  interaction: SessionStartInteraction;
}> {
  protected readonly offerRepository: OfferRepository;

  protected readonly requestRepository: RequestRepository;

  constructor(
    messages: BasicHermesMessageParser<z.ZodTypeAny>,
    offerRepository: OfferRepository,
    requestRepository: RequestRepository,
  ) {
    super(messages);
    this.offerRepository = offerRepository;
    this.requestRepository = requestRepository;
  }

  public create(
    config: RequirementConfig,
  ): Requirement<
    HermesPlaceholderContext,
    { interaction: SessionStartInteraction }
  > {
    const parsed = MaxOffersRequirementSchema.parse(config);
    return new MaxServicesEditRequirement(
      this.parser,
      parsed,
      this.offerRepository,
      this.requestRepository,
    );
  }

  public getId(): string {
    return 'max-services';
  }
}
