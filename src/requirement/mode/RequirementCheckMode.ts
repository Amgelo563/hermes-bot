// TODO: Ideally each service object should have its own requirement map but ¯\_(ツ)_/¯ this will do

export const RequirementCheckModeEnum = {
  Publish: 'publish',
  Repost: 'repost',
  Update: 'update',
} as const;

export type RequirementCheckMode =
  (typeof RequirementCheckModeEnum)[keyof typeof RequirementCheckModeEnum];
