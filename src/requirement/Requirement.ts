import type { Awaitable } from 'discord.js';
import type { RequirementConfig } from '../hermes/requirement/config/RequirementConfigSchema';
import type { RequirementResultData } from './result/RequirementResultData';

export interface Requirement<Context, Checked> {
  check(
    context: Context,
    checked: Checked,
  ): Awaitable<RequirementResultData | RequirementResultData[]>;

  getId(): string;

  initialize(config: RequirementConfig): void;
}
