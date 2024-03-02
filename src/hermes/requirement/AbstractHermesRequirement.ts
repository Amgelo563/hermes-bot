import { IllegalStateError } from '@nyx-discord/core';
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
  Input,
> implements HermesRequirement<Input>
{
  protected cachedConfig: Config | null = null;

  protected readonly parser: BasicHermesMessageParser<z.ZodTypeAny>;

  constructor(parser: BasicHermesMessageParser<z.ZodTypeAny>) {
    this.parser = parser;
  }

  public check(
    context: HermesPlaceholderContext,
    input: Input,
  ): Awaitable<RequirementResultData | RequirementResultData[]> {
    const config = this.cachedConfig;

    if (config === null) {
      throw new IllegalStateError();
    }

    return this.performCheck(context, input, config);
  }

  public abstract getId(): string;

  public initialize(config: RequirementConfig) {
    this.cachedConfig = this.parseConfig(config);
  }

  protected reject(config: { deny: boolean }): RequirementResult {
    return config.deny
      ? RequirementResultEnum.Deny
      : RequirementResultEnum.Warn;
  }

  protected abstract parseConfig(config: RequirementConfig): Config;

  protected abstract performCheck(
    context: HermesPlaceholderContext,
    checked: Input,
    config: Config,
  ): Awaitable<RequirementResultData | RequirementResultData[]>;
}
