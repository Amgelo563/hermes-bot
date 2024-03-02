export type WithRequired<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};
