import type { HermesPlaceholderContext } from '../../../hermes/message/context/HermesPlaceholderContext';
import type { WithRequired } from '../../../types/WithRequired';

export type BlacklistPlaceholderContext = WithRequired<
  HermesPlaceholderContext,
  'blacklist'
>;
