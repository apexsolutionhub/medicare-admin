"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApexDataTable } from "@/components/apex/ApexDataTable";
import { ApexTenantTabShell } from "@/components/apex/tenant/ApexTenantTabShell";
import { ApexEmptyState } from "@/components/apex/PageChrome";
import type { TenantStaff } from "@/lib/types";

type Props = {
  staff: TenantStaff[];
  busy: boolean;
  onToggleLogin: (userId: number, wasDisabled: boolean) => void;
};

export function ApexTenantStaffTable({ staff, busy, onToggleLogin }: Props) {
  const disabledCount = staff.filter((u) => u.login_disabled).length;
  const columns = useMemo<ColumnDef<TenantStaff>[]>(
    () => [
      {
        accessorKey: "username",
        header: "Username",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.username}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="capitalize text-muted-foreground">
            {row.original.role || "—"}
          </span>
        ),
      },
      {
        accessorKey: "login_disabled",
        header: "Login",
        cell: ({ row }) =>
          row.original.login_disabled ? (
            <Badge variant="destructive">Disabled</Badge>
          ) : (
            <Badge variant="success">Active</Badge>
          ),
        sortingFn: (a, b) =>
          Number(a.original.login_disabled) - Number(b.original.login_disabled),
      },
      {
        id: "action",
        header: () => <div className="text-right">Action</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              size="sm"
              variant={row.original.login_disabled ? "success" : "destructive"}
              className="apex-row-action"
              disabled={busy}
              onClick={() =>
                onToggleLogin(row.original.id, Boolean(row.original.login_disabled))
              }
            >
              {row.original.login_disabled ? "Enable" : "Disable"}
            </Button>
          </div>
        ),
      },
    ],
    [busy, onToggleLogin],
  );

  return (
    <ApexTenantTabShell
      title="Staff accounts"
      description="Emergency per-user login disable — does not change roles or passwords."
      icon={Users}
      tone="emerald"
      contentClassName="px-0 py-0"
      actions={
        disabledCount > 0 ? (
          <Badge variant="destructive">{disabledCount} disabled</Badge>
        ) : (
          <Badge variant="success">All active</Badge>
        )
      }
    >
      {staff.length === 0 ? (
        <div className="px-5 py-5 sm:px-6">
          <ApexEmptyState
            icon={Users}
            title="No staff accounts"
            description="Staff will appear here once created for this pharmacy."
          />
        </div>
      ) : (
        <ApexDataTable
          data={staff}
          columns={columns}
          noun="staff accounts"
          pageSize={10}
        />
      )}
    </ApexTenantTabShell>
  );
}
