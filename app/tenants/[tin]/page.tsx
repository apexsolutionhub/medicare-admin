"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ConsoleShell } from "@/components/ConsoleShell";
import { ApexPageHeader } from "@/components/apex/PageChrome";
import { ApexTenantSummaryStrip } from "@/components/apex/tenant/ApexTenantSummaryStrip";
import {
  ApexTenantSectionNav,
  type TenantTabId,
} from "@/components/apex/tenant/ApexTenantSectionNav";
import { ApexTenantReporting } from "@/components/apex/tenant/ApexTenantReporting";
import { ApexTenantBillingActions } from "@/components/apex/tenant/ApexTenantBillingActions";
import { ApexTenantBillingSettings } from "@/components/apex/tenant/ApexTenantBillingSettings";
import { ApexTenantAccessControl } from "@/components/apex/tenant/ApexTenantAccessControl";
import { ApexTenantStaffTable } from "@/components/apex/tenant/ApexTenantStaffTable";
import { ApexTenantPaymentsTable } from "@/components/apex/tenant/ApexTenantPaymentsTable";
import {
  approveQuarterlyPayment,
  approveSetupPayment,
  changeTenantStatus,
  getErrorMessage,
  getTenant,
  isUnauthenticatedError,
  rejectPayment,
  releaseBillingHold,
  setUserLoginDisabled,
  updateTenant,
} from "@/lib/api";
import type { PaymentSubmission, Tenant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function TenantDetailPage() {
  const params = useParams<{ tin: string }>();
  const tin = decodeURIComponent(params.tin);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<TenantTabId>("reports");
  const [initialLoad, setInitialLoad] = useState(true);

  const reload = useCallback(async () => {
    const data = await getTenant(tin);
    setTenant(data);
    setPayments(data.payments ?? []);
  }, [tin]);

  useEffect(() => {
    void reload()
      .catch((err) => {
        if (!isUnauthenticatedError(err)) toast.error(getErrorMessage(err));
      })
      .finally(() => setInitialLoad(false));
  }, [reload]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      toast.success("Updated");
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (initialLoad && !tenant) {
    return (
      <ConsoleShell>
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
          <Spinner /> Loading tenant…
        </div>
      </ConsoleShell>
    );
  }

  if (!tenant) {
    return (
      <ConsoleShell>
        <ApexPageHeader
          title="Tenant not found"
          description={`No pharmacy matched TIN ${tin}`}
          breadcrumbs={[
            { label: "Tenants", href: "/tenants" },
            { label: tin },
          ]}
        />
      </ConsoleShell>
    );
  }

  const pendingSetup = payments.find(
    (p) => p.payment_kind === "setup" && p.status === "pending",
  );

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <ApexPageHeader
          title={tenant.pharmacy_name || tin}
          description={`TIN ${tenant.pharmacy_tin}`}
          breadcrumbs={[
            { label: "Tenants", href: "/tenants" },
            { label: tenant.pharmacy_name || tin },
          ]}
          actions={
            tenant.account_status === "active" ? (
              <Button asChild size="sm" variant="apex">
                <Link href={`/feedback?tin=${encodeURIComponent(tin)}`}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Open chat
                </Link>
              </Button>
            ) : undefined
          }
        />

        <ApexTenantSummaryStrip tenant={tenant} />
        <ApexTenantSectionNav value={tab} onValueChange={setTab} />

        <div key={tab} className="apex-tenant-tab-panel min-w-0 space-y-6">
          {tab === "reports" ? (
            <ApexTenantReporting tenant={tenant} payments={payments} />
          ) : null}

          {tab === "payments" ? (
            <div className="space-y-6">
              <ApexTenantBillingActions
                tenant={tenant}
                payments={payments}
                busy={busy}
                onApproveSetup={() => run(() => approveSetupPayment(tin).then(() => undefined))}
                onRejectSetup={(rejectReason) =>
                  run(async () => {
                    if (!pendingSetup) return;
                    await rejectPayment(pendingSetup.id, rejectReason);
                  })
                }
                onApproveQuarterly={() =>
                  run(() => approveQuarterlyPayment(tin).then(() => undefined))
                }
                onReleaseHold={() => run(() => releaseBillingHold(tin).then(() => undefined))}
                onSetBillingHold={() =>
                  run(() =>
                    updateTenant(tin, { billing_hold: true }).then(() => undefined),
                  )
                }
              />
              <ApexTenantPaymentsTable
                tin={tin}
                payments={payments}
                busy={busy}
                onChanged={() => void reload()}
              />
            </div>
          ) : null}

          {tab === "access" ? (
            <ApexTenantAccessControl
              tenant={tenant}
              reason={reason}
              busy={busy}
              onReasonChange={setReason}
              onSuspend={() => run(() => changeTenantStatus(tin, "suspend", reason).then(() => undefined))}
              onBan={() => run(() => changeTenantStatus(tin, "ban", reason).then(() => undefined))}
              onUnsuspend={() => run(() => changeTenantStatus(tin, "unsuspend").then(() => undefined))}
              onUnban={() => run(() => changeTenantStatus(tin, "unban").then(() => undefined))}
              onDelete={() => run(() => changeTenantStatus(tin, "delete", reason).then(() => undefined))}
              onRestore={() =>
                run(() => changeTenantStatus(tin, "restore", reason || undefined).then(() => undefined))
              }
            />
          ) : null}

          {tab === "billing" ? (
            <ApexTenantBillingSettings
              key={`billing-${tenant.pharmacy_tin}-${tenant.quarterly_fee_etb}-${tenant.setup_fee_etb}`}
              tenant={tenant}
              busy={busy}
              onSave={(values) =>
                run(() =>
                  updateTenant(tin, {
                    setup_fee_etb: values.setup_fee_etb,
                    quarterly_fee_etb: values.quarterly_fee_etb,
                    billing_notes: values.billing_notes ?? "",
                    is_illustration: values.is_illustration,
                    billing_hold: values.billing_hold,
                    free_trial_ends_at: values.free_trial_ends_at,
                  }).then(() => undefined),
                )
              }
            />
          ) : null}

          {tab === "staff" ? (
            <ApexTenantStaffTable
              staff={tenant.staff ?? []}
              busy={busy}
              onToggleLogin={(userId, wasDisabled) =>
                run(() => setUserLoginDisabled(userId, !wasDisabled).then(() => undefined))
              }
            />
          ) : null}
        </div>
      </div>
    </ConsoleShell>
  );
}
