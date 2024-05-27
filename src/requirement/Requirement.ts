import type { Awaitable } from 'discord.js';
import type { RequirementResultData } from './result/RequirementResultData';

export interface Requirement<Context, Checked> {
  check(
    context: Context,
    checked: Checked,
  ): Awaitable<RequirementResultData | RequirementResultData[]>;
}
