"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  type Lead,
  type LeadStatus,
  type NewLeadInput,
} from "@/lib/types";
import { createLeadAction, updateLeadAction } from "@/app/actions/leads";

export function LeadFormDialog({
  lead,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  lead?: Lead;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(lead);

  function handleSubmit(formData: FormData) {
    const input: NewLeadInput = {
      name: String(formData.get("name") ?? ""),
      company: String(formData.get("company") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      status: formData.get("status") as LeadStatus,
      source: String(formData.get("source") ?? ""),
      dealValue: formData.get("dealValue") ? Number(formData.get("dealValue")) : null,
      notes: String(formData.get("notes") ?? ""),
      lastContactDate: (formData.get("lastContactDate") as string) || null,
      nextFollowUpDate: (formData.get("nextFollowUpDate") as string) || null,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateLeadAction(lead!.id, input)
        : await createLeadAction(input);
      if (result.ok) {
        toast.success(isEdit ? "Lead updated" : "Lead added");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as ReactElement} />}
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lead" : "Add lead"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this lead."
              : "Track a new prospect so you never lose the thread."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={lead?.name ?? ""} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={lead?.company ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealValue">Deal value ($)</Label>
              <Input
                id="dealValue"
                name="dealValue"
                type="number"
                min="0"
                step="100"
                defaultValue={lead?.dealValue ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={lead?.email ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={lead?.phone ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={lead?.status ?? "New"}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select name="source" defaultValue={lead?.source ?? "Referral"}>
                <SelectTrigger id="source" className="w-full">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lastContactDate">Last contact</Label>
              <Input
                id="lastContactDate"
                name="lastContactDate"
                type="date"
                defaultValue={lead?.lastContactDate ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextFollowUpDate">Next follow-up</Label>
              <Input
                id="nextFollowUpDate"
                name="nextFollowUpDate"
                type="date"
                defaultValue={lead?.nextFollowUpDate ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={lead?.notes ?? ""}
              placeholder="Context, next steps, what they care about…"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
