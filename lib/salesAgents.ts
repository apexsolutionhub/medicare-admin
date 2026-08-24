export type SalesAgentRow = {
  id: number;
  displayName: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  tenantCount: number;
};
