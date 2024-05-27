import type { OfferSessionData } from '../../../../bot/offer/sessions/OfferSessionData';
import { AbstractHermesRequirementFactory } from '../../../../hermes/requirement/AbstractHermesRequirementFactory';
import type { RequirementConfig } from '../../../../hermes/requirement/config/RequirementConfigSchema';
import { FieldRequirementConfigSchema } from '../../../../hermes/requirement/config/RequirementConfigSchema';
import type { HermesRequirement } from '../../../../hermes/requirement/HermesRequirement';
import { HasTagOfferEditRequirement } from './HasTagOfferEditRequirement';

// eslint-disable-next-line max-len
export class HasTagOfferEditRequirementFactory extends AbstractHermesRequirementFactory<OfferSessionData> {
  public getId(): string {
    return 'hasTag';
  }

  public create(
    config: RequirementConfig,
  ): HermesRequirement<OfferSessionData> {
    const parsed = FieldRequirementConfigSchema.parse(config);
    return new HasTagOfferEditRequirement(this.parser, parsed);
  }
}
