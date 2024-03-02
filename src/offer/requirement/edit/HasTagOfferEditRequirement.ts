import type { OfferSessionData } from '../../../bot/offer/sessions/OfferSessionData';
import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../../../hermes/requirement/AbstractHermesRequirement';
import type {
  FieldRequirementConfig,
  RequirementConfig,
} from '../../../hermes/requirement/config/RequirementConfigSchema';
import { FieldRequirementConfigSchema } from '../../../hermes/requirement/config/RequirementConfigSchema';
import type { RequirementResultData } from '../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../requirement/result/RequirementResultEnum';

export class HasTagOfferEditRequirement extends AbstractHermesRequirement<
  FieldRequirementConfig,
  OfferSessionData
> {
  public getId(): string {
    return 'hasTag';
  }

  protected parseConfig(config: RequirementConfig): FieldRequirementConfig {
    return FieldRequirementConfigSchema.parse(config);
  }

  protected performCheck(
    context: HermesPlaceholderContext,
    checked: OfferSessionData,
    config: FieldRequirementConfig,
  ): RequirementResultData {
    if (checked.offer.tags.length) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    return {
      allowed: this.reject(config),
      message: this.parser.parseEmbedField(config.message, context),
    };
  }
}
