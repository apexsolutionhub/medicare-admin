"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { ApexDataTable } from "@/components/apex/ApexDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApexTenantTabShell } from "@/components/apex/tenant/ApexTenantTabShell";
import { ApexEmptyState } from "@/components/apex/PageChrome";
import {
  approveQuarterlyPayment,
  approveSetupPayment,
  getErrorMessage,
  rejectPayment,
} from "@/lib/api";
import type { PaymentSubmission } from "@/lib/types";

type Props = {
  tin: string;
  payments: PaymentSubmission[];
  busy: boolean;
  onChanged: () => void;
};

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "approved" || s === "paid") return <Badge variant="success">Approved</Badge>;
  if (s === "pending") return <Badge variant="warning">Pending</Badge>;
  if (s === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return (
    <Badge variant="outline" className="capitalize">
      {status}
    </Badge>
  );
}

export function ApexTenantPaymentsTable({ tin, payments, busy, onChanged }: Props) {
  const [rejectReason, setRejectReason] = useState<Record<number, string>>({});
  const [actingId, setActingId] = useState<number | null>(null);
  const pendingCount = payments.filter(
    (p) => String(p.status).toLowerCase() === "pending",
  ).length;

  const run = async (id: number, fn: () => Promise<void>) => {
    setActingId(id);
    try {
      await fn();
      toast.success("Payment updated");
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  };

  const columns = useMemo<ColumnDef<PaymentSubmission>[]>(
    () => [
      {
        accessorKey: "payment_kind",
        header: "Kind",
        cell: ({ row }) => (
          <span className="font-medium capitalize">{row.original.payment_kind}</span>
        ),
      },
      {
        accessorKey: "amount_etb",
        header: "Amount",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.amount_etb.toLocaleString()} ETB
          </span>
        ),
      },
      {
        accessorKey: "transaction_ref",
        header: "Reference",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.transaction_ref}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => statusBadge(row.original.status),
      },
      {
        accessorKey: "submitted_at",
        header: "Submitted",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {new Date(row.original.submitted_at).toLocaleString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.status === "pending" ? (
              <div className="flex flex-col items-end gap-2">
                <Button
                  size="sm"
                  variant="success"
                  className="apex-row-action"
                  disabled={busy || actingId === row.original.id}
                  onClick={() =>
                    run(row.original.id, async () => {
                      if (row.original.payment_kind === "setup") {
                        await approveSetupPayment(tin);
                      } else {
                        await approveQuarterlyPayment(tin);
                      }
                    })
                  }
                >
                  Approve
                </Button>
                <div className="flex gap-1">
                  <Input
                    className="h-7 w-28 text-xs"
                    placeholder="Reject reason"
                    value={rejectReason[row.original.id] ?? ""}
                    onChange={(e) =>
                      setRejectReason((prev) => ({
                        ...prev,
                        [row.original.id]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="apex-row-action"
                    disabled={
                      busy ||
                      actingId === row.original.id ||
                      !rejectReason[row.original.id]?.trim()
                    }
                    onClick={() =>
                      run(row.original.id, () =>
                        rejectPayment(
                          row.original.id,
                          rejectReason[row.original.id] ?? "",
                        ).then(() => undefined),
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        ),
      },
    ],
    [actingId, busy, rejectReason, tin],
  );

  return (
    <ApexTenantTabShell
      title="Payment history"
      description="Approve or reject pending submissions from this pharmacy."
      icon={Receipt}
      tone="gold"
      contentClassName="px-0 py-0"
      actions={
        pendingCount > 0 ? (
          <Badge variant="warning">{pendingCount} pending</Badge>
        ) : (
          <Badge variant="outline">{payments.length} total</Badge>
        )
      }
    >
      {payments.length === 0 ? (
        <div className="px-5 py-5 sm:px-6">
          <ApexEmptyState
            icon={Receipt}
            title="No payment submissions"
            description="Setup and quarterly proofs will list here once submitted."
          />
        </div>
      ) : (
        <ApexDataTable
          data={payments}
          columns={columns}
          noun="payments"
          pageSize={10}
        />
      )}
    </ApexTenantTabShell>
  );
}
