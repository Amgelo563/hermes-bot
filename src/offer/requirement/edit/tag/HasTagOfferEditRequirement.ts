import type { OfferSessionData } from '../../../../bot/offer/sessions/OfferSessionData';
import type { HermesPlaceholderContext } from '../../../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../../../../hermes/requirement/AbstractHermesRequirement';
import type { FieldRequirementConfig } from '../../../../hermes/requirement/config/RequirementConfigSchema';
import type { RequirementResultData } from '../../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../../requirement/result/RequirementResultEnum';

export class HasTagOfferEditRequirement extends AbstractHermesRequirement<
  FieldRequirementConfig,
  OfferSessionData
> {
  public check(
    context: HermesPlaceholderContext,
    checked: OfferSessionData,
  ): RequirementResultData {
    if (checked.offer.tags.length) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    return {
      allowed: this.reject(),
      message: this.parser.parseEmbedField(this.config.message, context),
    };
  }
}
