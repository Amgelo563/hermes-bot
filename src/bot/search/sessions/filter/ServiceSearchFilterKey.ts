export const ServiceSearchFilterKeyEnum = {
  Date: 'Date',
  Tags: 'Tags',
} as const;

export type ServiceSearchFilterKeyType =
  (typeof ServiceSearchFilterKeyEnum)[keyof typeof ServiceSearchFilterKeyEnum];
