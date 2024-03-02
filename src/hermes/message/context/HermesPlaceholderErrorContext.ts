import type { WithRequired } from '../../../types/WithRequired';
import type { HermesPlaceholderContext } from './HermesPlaceholderContext';

export type HermesPlaceholderErrorContext = WithRequired<
  HermesPlaceholderContext,
  'error'
>;
