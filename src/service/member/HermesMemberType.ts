export const HermesMemberTypeEnum = {
  // Real member (is present in guild)
  Real: 'real',
  // Mocked member (user exists, but isn't in guild), mock created from user data
  Mock: 'mock',
  // User doesn't exist (deleted account)
  UnknownUser: 'unknown',
};

export type HermesMemberType =
  (typeof HermesMemberTypeEnum)[keyof typeof HermesMemberTypeEnum];
