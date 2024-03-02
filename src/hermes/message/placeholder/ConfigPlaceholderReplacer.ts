import type { HermesConfig } from '../../../config/HermesConfigSchema';
import { AbstractObjectPlaceholderReplacer } from './abstract/AbstractObjectPlaceholderReplacer';

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
