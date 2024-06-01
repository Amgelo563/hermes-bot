import type { z } from 'zod';
import type { RequestSessionData } from '../../../../bot/request/sessions/RequestSessionData';
import type { OfferRepository } from '../../../../hermes/database/OfferRepository';
import type { BasicHermesMessageParser } from '../../../../hermes/message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../../../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../../../../hermes/requirement/AbstractHermesRequirement';
import type { OfferPlaceholderContext } from '../../../../offer/message/placeholder/OfferPlaceholderContext';
import type { RequirementResultData } from '../../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../../requirement/result/RequirementResultEnum';
import type { SearchOffersRequirementConfig } from './SearchOffersRequirementFactory';

export class SearchOffersRequirement extends AbstractHermesRequirement<
  SearchOffersRequirementConfig,
  RequestSessionData
> {
  protected readonly offerRepository: OfferRepository;

  constructor(
    parser: BasicHermesMessageParser<z.ZodTypeAny>,
    config: SearchOffersRequirementConfig,
    offerRepository: OfferRepository,
  ) {
    super(parser, config);
    this.offerRepository = offerRepository;
  }

  public async check(
    context: HermesPlaceholderContext,
    checked: RequestSessionData,
  ): Promise<RequirementResultData> {
    const config = this.config;
    const { tag } = checked;
    if (!tag) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    const offers = await this.offerRepository.findNWithTag(tag.id, config.max);
    if (!offers.length) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    const dataContexts: OfferPlaceholderContext[] = [];
    for (const offer of offers) {
      dataContexts.push({
        ...context,
        member: checked.member,
        services: {
          ...context.services,
          offer,
        },
      });
    }

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
