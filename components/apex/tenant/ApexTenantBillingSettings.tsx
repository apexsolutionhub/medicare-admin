"use client";

import { useMemo, useState } from "react";
import { format, isValid, startOfDay } from "date-fns";
import {
  CalendarDays,
  CalendarIcon,
  CircleDollarSign,
  NotebookPen,
  Settings2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ApexTenantMetricTile,
  ApexTenantTabShell,
} from "@/components/apex/tenant/ApexTenantTabShell";
import type { Tenant } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatEtb(n: number) {
  return `${n.toLocaleString("en-US")} ETB`;
}

function parseTrialDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isValid(d) ? startOfDay(d) : undefined;
}

function toDateKey(d: Date | undefined): string {
  return d && isValid(d) ? format(d, "yyyy-MM-dd") : "";
}

type Props = {
  tenant: Tenant;
  busy: boolean;
  onSave: (values: {
    setup_fee_etb: number;
    quarterly_fee_etb: number;
    billing_notes: string | null;
    is_illustration: boolean;
    billing_hold: boolean;
    free_trial_ends_at: string | null;
  }) => void;
};

export function ApexTenantBillingSettings({ tenant, busy, onSave }: Props) {
  const [setupFee, setSetupFee] = useState(String(tenant.setup_fee_etb ?? 0));
  const [quarterlyFee, setQuarterlyFee] = useState(String(tenant.quarterly_fee_etb ?? 0));
  const [notes, setNotes] = useState(tenant.billing_notes ?? "");
  const [illustration, setIllustration] = useState(Boolean(tenant.is_illustration));
  const [hold, setHold] = useState(Boolean(tenant.billing_hold));
  const [trialEnd, setTrialEnd] = useState<Date | undefined>(() =>
    parseTrialDate(tenant.free_trial_ends_at),
  );
  const [trialOpen, setTrialOpen] = useState(false);

  const setupNum = Number(setupFee) || 0;
  const quarterlyNum = Number(quarterlyFee) || 0;

  const dirty = useMemo(() => {
    return (
      setupNum !== (tenant.setup_fee_etb ?? 0) ||
      quarterlyNum !== (tenant.quarterly_fee_etb ?? 0) ||
      notes.trim() !== (tenant.billing_notes ?? "").trim() ||
      illustration !== Boolean(tenant.is_illustration) ||
      hold !== Boolean(tenant.billing_hold) ||
      toDateKey(trialEnd) !== toDateKey(parseTrialDate(tenant.free_trial_ends_at))
    );
  }, [
    setupNum,
    quarterlyNum,
    notes,
    illustration,
    hold,
    trialEnd,
    tenant,
  ]);

  return (
    <ApexTenantTabShell
      title="Billing & fees"
      description="Edit setup and quarterly amounts, trial window, and billing notes."
      icon={Settings2}
      tone="violet"
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <ApexTenantMetricTile
            label="Current setup"
            value={formatEtb(tenant.setup_fee_etb ?? 0)}
            sub={tenant.setup_fee_approved ? "Approved" : "Pending"}
          />
          <ApexTenantMetricTile
            label="Current quarterly"
            value={formatEtb(tenant.quarterly_fee_etb ?? 0)}
            sub={`${tenant.paid_quarters_count ?? 0} quarters paid`}
          />
        </div>

        <section className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-[oklch(0.78_0.06_85)]" />
            <h3 className="text-sm font-semibold">Fee amounts</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="setup-fee">Setup fee (ETB)</Label>
              <Input
                id="setup-fee"
                type="number"
                min={0}
                step={1000}
                value={setupFee}
                onChange={(e) => setSetupFee(e.target.value)}
                className="h-11 tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quarterly-fee">Quarterly fee (ETB)</Label>
              <Input
                id="quarterly-fee"
                type="number"
                min={0}
                step={1000}
                value={quarterlyFee}
                onChange={(e) => setQuarterlyFee(e.target.value)}
                className="h-11 tabular-nums"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[oklch(0.72_0.08_195)]" />
            <h3 className="text-sm font-semibold">Free trial</h3>
          </div>
          <div className="space-y-2">
            <Label>Trial end date</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={trialOpen} onOpenChange={setTrialOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    id="trial-end"
                    className={cn(
                      "h-11 min-w-[16rem] flex-1 justify-start gap-2 px-3 font-normal sm:max-w-sm",
                      !trialEnd && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 shrink-0 text-[oklch(0.75_0.05_85)]" />
                    {trialEnd ? (
                      <span className="tabular-nums">{format(trialEnd, "PPP")}</span>
                    ) : (
                      <span>Select trial end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border-border/70 p-0 shadow-xl"
                  align="start"
                  sideOffset={6}
                >
                  <Calendar
                    mode="single"
                    selected={trialEnd}
                    captionLayout="dropdown"
                    buttonVariant="ghost"
                    defaultMonth={trialEnd ?? new Date()}
                    onSelect={(date) => {
                      setTrialEnd(date ? startOfDay(date) : undefined);
                      setTrialOpen(false);
                    }}
                    disabled={{ before: startOfDay(new Date()) }}
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      onClick={() => {
                        setTrialEnd(undefined);
                        setTrialOpen(false);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() => setTrialOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {trialEnd ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 shrink-0"
                  aria-label="Clear trial end date"
                  onClick={() => setTrialEnd(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-[oklch(0.72_0.08_300)]" />
            <h3 className="text-sm font-semibold">Notes & enforcement</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-notes">Apex billing notes</Label>
            <Textarea
              id="billing-notes"
              rows={4}
              className="min-h-26 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Discounts, legacy terms, follow-up notes…"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              htmlFor="illustration"
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/15 px-4 py-3.5 transition-colors hover:border-white/14"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">Illustration tenant</p>
                <p className="text-xs text-muted-foreground">No billing enforcement</p>
              </div>
              <Switch
                id="illustration"
                checked={illustration}
                onCheckedChange={setIllustration}
              />
            </label>
            <label
              htmlFor="billing-hold"
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/15 px-4 py-3.5 transition-colors hover:border-white/14"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">Billing hold</p>
                <p className="text-xs text-muted-foreground">Pause billing and block staff login</p>
              </div>
              <Switch id="billing-hold" checked={hold} onCheckedChange={setHold} />
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <p className="text-xs text-muted-foreground">
            {dirty ? "You have unsaved billing changes." : "All billing settings are saved."}
          </p>
          <Button
            size="sm"
            variant="apex"
            className="min-w-40 cursor-pointer"
            disabled={busy || !dirty}
            onClick={() =>
              onSave({
                setup_fee_etb: setupNum,
                quarterly_fee_etb: quarterlyNum,
                billing_notes: notes.trim() || null,
                is_illustration: illustration,
                billing_hold: hold,
                free_trial_ends_at: trialEnd ? startOfDay(trialEnd).toISOString() : null,
              })
            }
          >
            {busy ? "Saving…" : "Save billing settings"}
          </Button>
        </div>
      </div>
    </ApexTenantTabShell>
  );
}
