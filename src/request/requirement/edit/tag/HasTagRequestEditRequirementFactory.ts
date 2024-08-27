import type { RequestSessionData } from '../../../../bot/request/sessions/RequestSessionData';
import type { HermesPlaceholderContext } from '../../../../hermes/message/context/HermesPlaceholderContext';
import { AbstractHermesRequirementFactory } from '../../../../hermes/requirement/AbstractHermesRequirementFactory';
import type { RequirementConfig } from '../../../../hermes/requirement/config/RequirementConfigSchema';
import { FieldRequirementConfigSchema } from '../../../../hermes/requirement/config/RequirementConfigSchema';
import type { Requirement } from '../../../../requirement/Requirement';
import { HasTagRequestEditRequirement } from './HasTagRequestEditRequirement';

// eslint-disable-next-line max-len
export class HasTagRequestEditRequirementFactory extends AbstractHermesRequirementFactory<RequestSessionData> {
  public create(
    config: RequirementConfig,
  ): Requirement<HermesPlaceholderContext, RequestSessionData> {
    const parsed = FieldRequirementConfigSchema.parse(config);
    return new HasTagRequestEditRequirement(this.parser, parsed);
  }

  public getId(): string {
    return 'has-tag';
  }
}
