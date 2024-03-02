import type { MessagePlaceholderReplacer } from '../../../../message/placeholder/replace/MessagePlaceholderReplacer';
import type { HermesPlaceholderContext } from '../../context/HermesPlaceholderContext';

export interface HermesPlaceholderReplacer
  extends MessagePlaceholderReplacer<HermesPlaceholderContext> {}
