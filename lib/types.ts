export type ApexUser = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  is_superadmin: boolean;
  actor_type: string;
};

export type PaymentSubmission = {
  id: number;
  pharmacy_tin: string;
  pharmacy_name?: string;
  payment_kind: "setup" | "quarterly" | "yearly" | string;
  amount_etb: number;
  payment_channel: string;
  transaction_ref: string;
  status: "pending" | "approved" | "rejected" | string;
  submitted_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string;
  quarter_number?: number | null;
};

export type Tenant = {
  id: number;
  pharmacy_tin: string;
  pharmacy_name: string;
  phone?: string;
  logo_url: string;
  account_status: "active" | "suspended" | "banned" | "deleted" | string;
  status_reason: string;
  status_changed_at: string | null;
  setup_fee_etb?: number;
  quarterly_fee_etb?: number;
  yearly_fee_etb?: number;
  payment_channel?: string;
  payment_transaction_ref?: string;
  setup_fee_approved?: boolean;
  subscription_payment_approved?: boolean;
  subscription_paid_until?: string | null;
  paid_quarters_count?: number;
  billing_hold?: boolean;
  billing_started_at?: string | null;
  free_trial_ends_at?: string | null;
  is_illustration?: boolean;
  billing_notes?: string;
  modules?: string[];
  fees_manually_set?: boolean;
  created_at: string;
  updated_at: string;
  manager_count?: number;
  manager_username?: string;
  pharmacist_count?: number;
  staff_count?: number;
  staff?: TenantStaff[];
  payments?: PaymentSubmission[];
};

export type TenantStaff = {
  id: number;
  username: string;
  role: string;
  pharmacy_name: string;
  logoUrl: string;
  pharmacy_tin: string;
  login_disabled?: boolean;
};

export type CreateTenantPayload = {
  pharmacy_tin: string;
  pharmacy_name: string;
  logo_url?: string;
  manager_username: string;
  manager_password: string;
  setup_fee_etb?: number;
  quarterly_fee_etb?: number;
  yearly_fee_etb?: number;
  modules?: string[];
  waive_setup_fee?: boolean;
};

export type DashboardSummary = {
  tenants_total: number;
  tenants_active: number;
  suspended_tenants?: number;
  banned_tenants?: number;
  inactive_tenants?: number;
  pending_setup_payments: number;
  pending_quarterly_payments: number;
  pending_yearly_payments?: number;
  setup_pending_tenants?: number;
  unread_feedback?: number;
  disabled_users?: number;
};

export type PricingRule = {
  id: number;
  business_type: string;
  modules_key: string;
  modules: string[];
  setup_fee_etb: number;
  quarterly_fee_etb: number;
  yearly_fee_etb: number;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type FeedbackDirectoryRow = {
  pharmacy_tin: string;
  pharmacy_name: string;
  logo_url?: string;
  account_status: string;
  thread_id: number | null;
  thread_status: string | null;
  unread_count: number;
  last_message_at: string | null;
  last_message?: {
    body: string;
    sender_side: string;
    created_at: string;
  } | null;
};

export type FeedbackMessage = {
  id: number;
  sender_side: "tenant" | "apex" | string;
  body: string;
  image_url?: string;
  sender_username: string;
  created_at: string;
  read_by_tenant?: boolean;
  read_by_apex?: boolean;
};

export type AuditLogRow = {
  id: number;
  action: string;
  pharmacy_tin: string;
  actor_username: string;
  detail: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type TenantUserRow = {
  id: number;
  username: string;
  role: string;
  pharmacy_tin: string;
  pharmacy_name: string;
  is_active: boolean;
  login_disabled: boolean;
};

export type SignupReviewStatus = "pending" | "approved" | "rejected";

export type SignupRow = {
  pharmacy_tin: string;
  pharmacy_name: string;
  created_at: string;
  setup_fee_etb: number;
  free_trial_ends_at: string | null;
  payment_transaction_ref: string;
  payment_channel: string;
  has_pending_submission: boolean;
  pending_setup_payment_id?: number | null;
  status: SignupReviewStatus;
  manager_username?: string;
};

export type AnalyticsSummary = {
  tenants_by_status: Record<string, number>;
  approved_payments_by_kind: Record<string, number>;
  open_threads: number;
  pricing_rules_active: number;
};
