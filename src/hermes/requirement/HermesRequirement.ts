import type { Requirement } from '../../requirement/Requirement';
import type { HermesPlaceholderContext } from '../message/context/HermesPlaceholderContext';
import type { RequirementConfig } from './config/RequirementConfigSchema';

export interface HermesRequirement<Input>
  extends Requirement<HermesPlaceholderContext, Input> {
  initialize(config: RequirementConfig): void;
}
