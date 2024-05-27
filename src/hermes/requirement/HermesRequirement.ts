import type { Requirement } from '../../requirement/Requirement';
import type { HermesPlaceholderContext } from '../message/context/HermesPlaceholderContext';

export interface HermesRequirement<Input>
  extends Requirement<HermesPlaceholderContext, Input> {}
