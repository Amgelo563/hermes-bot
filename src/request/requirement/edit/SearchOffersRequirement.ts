import { z } from 'zod';
import type { RequestSessionData } from '../../../bot/request/sessions/RequestSessionData';
import type { OfferRepository } from '../../../hermes/database/OfferRepository';
import type { BasicHermesMessageParser } from '../../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../../../hermes/requirement/AbstractHermesRequirement';
import type { RequirementConfig } from '../../../hermes/requirement/config/RequirementConfigSchema';
import { EmbedRequirementConfigSchema } from '../../../hermes/requirement/config/RequirementConfigSchema';
import type { OfferPlaceholderContext } from '../../../offer/message/placeholder/OfferPlaceholderContext';
import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../requirement/result/RequirementResultEnum';

const SearchOffersRequirementConfigSchema = EmbedRequirementConfigSchema.extend(
  {
    max: z.number().default(5),
  },
);

type SearchOffersRequirementConfig = z.infer<
  typeof SearchOffersRequirementConfigSchema
>;

export class SearchOffersRequirement extends AbstractHermesRequirement<
  SearchOffersRequirementConfig,
  RequestSessionData
> {
  protected readonly offerRepository: OfferRepository;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    offerRepository: OfferRepository,
  ) {
    super(parser);

    this.offerRepository = offerRepository;
  }

  public getId(): string {
    return 'searchOffers';
  }

  protected parseConfig(
    config: RequirementConfig,
  ): SearchOffersRequirementConfig {
    return SearchOffersRequirementConfigSchema.parse(config);
  }

  protected async performCheck(
    context: HermesPlaceholderContext,
    checked: RequestSessionData,
    config: SearchOffersRequirementConfig,
  ): Promise<RequirementResultData> {
    const { tag } = checked;
    if (!tag) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    const offers = await this.offerRepository.findNWithTag(tag.id, config.max);
    const dataContexts: OfferPlaceholderContext[] = offers.map((offer) => ({
      ...context,
      services: {
        ...context.services,
        offer,
      },
    }));

    return {
      allowed:
        offers.length > 0 ? this.reject(config) : RequirementResultEnum.Allow,
      message: this.parser.parseTemplatedEmbed(
        config.message,
        context,
        dataContexts,
      ),
    };
  }
}
