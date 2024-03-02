import type { RequirementResultEnum } from './RequirementResultEnum';
import type { RequirementResultUserMessage } from './RequirementResultUserMessage';

export type AllowedRequirementResultData = {
  allowed: typeof RequirementResultEnum.Allow;
  message?: RequirementResultUserMessage;
};

export type WarnedRequirementResultData = {
  allowed: typeof RequirementResultEnum.Warn;
  message: RequirementResultUserMessage;
};

export type DeniedRequirementResultData = {
  allowed: typeof RequirementResultEnum.Deny;
  message: RequirementResultUserMessage;
};

export type RequirementResultData =
  | WarnedRequirementResultData
  | AllowedRequirementResultData
  | DeniedRequirementResultData;
