import type { Awaitable } from 'discord.js';
import type { z } from 'zod';
import type { RequirementResultData } from '../../requirement/result/RequirementResultData';
import type { RequirementResult } from '../../requirement/result/RequirementResultEnum';
import { RequirementResultEnum } from '../../requirement/result/RequirementResultEnum';
import type { BasicHermesMessageParser } from '../message/BasicHermesMessageParser';
import type { HermesPlaceholderContext } from '../message/context/HermesPlaceholderContext';
import type { RequirementConfig } from './config/RequirementConfigSchema';
import type { HermesRequirement } from './HermesRequirement';

export abstract class AbstractHermesRequirement<
  Config extends RequirementConfig,
  Checked,
> implements HermesRequirement<Checked>
{
  protected readonly config: Config;

  protected readonly parser: BasicHermesMessageParser<z.ZodTypeAny>;

  constructor(parser: BasicHermesMessageParser<z.ZodTypeAny>, config: Config) {
    this.parser = parser;
    this.config = config;
  }

  public abstract check(
    context: HermesPlaceholderContext,
    checked: Checked,
  ): Awaitable<RequirementResultData | RequirementResultData[]>;

  protected reject(config: { deny: boolean } = this.config): RequirementResult {
    return config.deny
      ? RequirementResultEnum.Deny
      : RequirementResultEnum.Warn;
  }
}
