import type { RequirementFactory } from '../../requirement/factory/RequirementFactory';
import type { HermesPlaceholderContext } from '../message/context/HermesPlaceholderContext';

export interface HermesRequirementFactory<Checked>
  extends RequirementFactory<HermesPlaceholderContext, Checked> {}
