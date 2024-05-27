import type { RequestSessionData } from '../../../../bot/request/sessions/RequestSessionData';
import type { HermesPlaceholderContext } from '../../../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirement } from '../../../../hermes/requirement/AbstractHermesRequirement';
import type { FieldRequirementConfig } from '../../../../hermes/requirement/config/RequirementConfigSchema';
import type { RequirementResultData } from '../../../../requirement/result/RequirementResultData';
import { RequirementResultEnum } from '../../../../requirement/result/RequirementResultEnum';

export class HasTagRequestEditRequirement extends AbstractHermesRequirement<
  FieldRequirementConfig,
  RequestSessionData
> {
  public check(
    context: HermesPlaceholderContext,
    checked: RequestSessionData,
  ): RequirementResultData {
    const config = this.config;

    if (checked.tag) {
      return {
        allowed: RequirementResultEnum.Allow,
      };
    }

    return {
      allowed: this.reject(),
      message: this.parser.parseEmbedField(config.message, context),
    };
  }
}
