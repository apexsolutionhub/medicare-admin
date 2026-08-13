import Link from "next/link";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApexEmptyState } from "@/components/apex/PageChrome";
import { cn } from "@/lib/utils";
import type { ChartSlice } from "@/lib/analytics";

const BAR_COLORS = [
  "bg-[oklch(0.62_0.06_85)]",
  "bg-[oklch(0.55_0.05_220)]",
  "bg-[oklch(0.58_0.05_300)]",
  "bg-[oklch(0.6_0.05_145)]",
  "bg-[oklch(0.58_0.05_75)]",
];

export function ApexSubscriptionBreakdown({ data }: { data: ChartSlice[] }) {
  const max = Math.max(...data.map((r) => r.value), 1);

  return (
    <Card className="apex-panel-surface border-2">
      <CardHeader className="border-b border-white/6 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.3_0.04_85)] text-[oklch(0.88_0.04_85)] ring-1 ring-[oklch(0.55_0.05_85/0.3)]">
            <Building2 className="h-4 w-4" />
          </span>
          Pharmacies by billing stage
        </CardTitle>
        <CardDescription className="text-[13px]">
          Subscription and onboarding status across the Medicare portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {data.length === 0 ? (
          <ApexEmptyState
            icon={Building2}
            title="No tenant data yet"
            description="Pharmacies will appear here once they register on Medicare."
          />
        ) : (
          data.map((row, i) => (
            <Link
              key={row.key}
              href="/tenants"
              className="group block cursor-pointer rounded-lg p-2 transition-colors hover:bg-white/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-foreground transition-colors group-hover:text-[oklch(0.88_0.04_85)]">
                  {row.label}
                </span>
                <span className="rounded-md bg-white/6 px-2 py-0.5 font-semibold tabular-nums text-foreground ring-1 ring-white/8">
                  {row.value}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6 ring-1 ring-white/6">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    BAR_COLORS[i % BAR_COLORS.length],
                  )}
                  style={{ width: `${Math.max(6, (row.value / max) * 100)}%` }}
                />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
