export const ServiceSearchFilterKeyEnum = {
  Date: 'date',
  Tags: 'tags',
} as const;

export type ServiceSearchFilterKeyType =
  (typeof ServiceSearchFilterKeyEnum)[keyof typeof ServiceSearchFilterKeyEnum];
