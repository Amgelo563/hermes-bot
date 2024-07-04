import { AbstractObjectPlaceholderReplacer } from '../../hermes/message/placeholder/AbstractObjectPlaceholderReplacer';
import type { HermesConfig } from '../file/HermesConfigSchema';

export class ConfigPlaceholderReplacer extends AbstractObjectPlaceholderReplacer {
  protected readonly object: HermesConfig;

  constructor(config: HermesConfig) {
    super();

    this.object = config;
  }

  public getNamespace(): string {
    return 'config';
  }
}
