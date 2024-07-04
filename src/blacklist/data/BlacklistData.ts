export type BlacklistData = {
  id: string;
  reason: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date | null;
};
