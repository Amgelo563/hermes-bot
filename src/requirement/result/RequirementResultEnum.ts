export const RequirementResultEnum = {
  Deny: 'deny',
  Allow: 'allow',
  Warn: 'warn',
} as const;

export type RequirementResult =
  (typeof RequirementResultEnum)[keyof typeof RequirementResultEnum];
