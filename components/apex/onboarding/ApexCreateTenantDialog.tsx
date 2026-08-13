"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import CustomFormField, { formFieldTypes } from "@/components/customFormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { createTenant, getErrorMessage } from "@/lib/api";

const createSchema = z.object({
  pharmacy_tin: z.string().min(1, "TIN is required"),
  pharmacy_name: z.string().min(1, "Pharmacy name is required"),
  logo_url: z.string().optional(),
  manager_username: z.string().min(1, "Manager username is required"),
  manager_password: z.string().min(6, "Password must be at least 6 characters"),
  waive_setup_fee: z.boolean().optional(),
});

type CreateValues = z.infer<typeof createSchema>;

type Props = {
  onCreated?: () => void;
  trigger?: ReactNode;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "apex" | "outline";
  children?: ReactNode;
};

export function ApexCreateTenantDialog({
  onCreated,
  trigger,
  size = "sm",
  variant = "apex",
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      pharmacy_tin: "",
      pharmacy_name: "",
      logo_url: "",
      manager_username: "",
      manager_password: "",
      waive_setup_fee: false,
    },
  });

  async function onCreate(values: CreateValues) {
    try {
      await createTenant({
        pharmacy_tin: values.pharmacy_tin.trim(),
        pharmacy_name: values.pharmacy_name.trim(),
        logo_url: values.logo_url?.trim() || "",
        manager_username: values.manager_username.trim(),
        manager_password: values.manager_password,
        waive_setup_fee: Boolean(values.waive_setup_fee),
      });
      toast.success("Tenant created");
      form.reset();
      setOpen(false);
      onCreated?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant={variant} size={size}>
            <PlusIcon className="size-4" />
            {children ?? "Create tenant"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New pharmacy tenant</DialogTitle>
          <DialogDescription>
            Creates a TenantAccount and the first Manager login for Medicare.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onCreate)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <CustomFormField
              control={form.control}
              name="pharmacy_tin"
              fieldType={formFieldTypes.INPUT}
              label="Pharmacy TIN"
              placeholder="0068194361"
            />
            <CustomFormField
              control={form.control}
              name="pharmacy_name"
              fieldType={formFieldTypes.INPUT}
              label="Pharmacy name"
              placeholder="Medicare Central"
            />
            <CustomFormField
              control={form.control}
              name="logo_url"
              fieldType={formFieldTypes.IMAGE_UPLOADER}
              label="Logo"
              placeholder="Upload pharmacy logo"
              className="sm:col-span-2"
            />
            <CustomFormField
              control={form.control}
              name="manager_username"
              fieldType={formFieldTypes.INPUT}
              label="Manager username"
              placeholder="manager"
            />
            <CustomFormField
              control={form.control}
              name="manager_password"
              fieldType={formFieldTypes.INPUT}
              type="password"
              label="Manager password"
              placeholder="••••••••"
            />
            <CustomFormField
              control={form.control}
              name="waive_setup_fee"
              fieldType={formFieldTypes.SWITCH}
              label="Waive setup fee"
              description="Approve setup immediately (skip payment portal)."
              className="sm:col-span-2"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Spinner />
                  Creating…
                </>
              ) : (
                "Create tenant + manager"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
