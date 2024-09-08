import { z } from 'zod';

import type { RequestSessionData } from '../../../../bot/request/sessions/RequestSessionData';
import type { BasicHermesMessageParser } from '../../../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirementFactory } from '../../../../hermes/requirement/AbstractHermesRequirementFactory';
import type { RequirementConfig } from '../../../../hermes/requirement/config/RequirementConfigSchema';
import { EmbedRequirementConfigSchema } from '../../../../hermes/requirement/config/RequirementConfigSchema';
import type { OfferRepository } from '../../../../offer/database/OfferRepository';
import type { Requirement } from '../../../../requirement/Requirement';
import type { DiscordServiceAgent } from '../../../../service/discord/DiscordServiceAgent';
import { SearchOffersRequirement } from './SearchOffersRequirement';

const SearchOffersRequirementConfigSchema = EmbedRequirementConfigSchema.extend(
  {
    max: z.number().default(5),
  },
);

export type SearchOffersRequirementConfig = z.infer<
  typeof SearchOffersRequirementConfigSchema
>;

// eslint-disable-next-line max-len
export class SearchOffersRequirementFactory extends AbstractHermesRequirementFactory<RequestSessionData> {
  protected readonly offerRepository: OfferRepository;

  protected readonly agent: DiscordServiceAgent;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    offerRepository: OfferRepository,
    agent: DiscordServiceAgent,
  ) {
    super(parser);
    this.offerRepository = offerRepository;
    this.agent = agent;
  }

  public create(
    config: RequirementConfig,
  ): Requirement<HermesPlaceholderContext, RequestSessionData> {
    const parsed = SearchOffersRequirementConfigSchema.parse(config);
    return new SearchOffersRequirement(
      this.parser,
      parsed,
      this.offerRepository,
      this.agent,
    );
  }

  public getId(): string {
    return 'search-offers';
  }
}
