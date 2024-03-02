import type { DeepRequired } from '../../../types/DeepRequired';
import type { HermesPlaceholderContext } from './HermesPlaceholderContext';

export type HermesServicePlaceholderContext<
  K extends keyof NonNullable<HermesPlaceholderContext['services']>,
> = DeepRequired<HermesPlaceholderContext, ['services', K]>;
