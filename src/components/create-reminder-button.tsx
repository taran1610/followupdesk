"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2 } from "lucide-react";
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
import { FOLLOWUP_CHANNELS, type FollowupChannel } from "@/lib/types";
import { addDaysISO, todayISODate } from "@/lib/date";
import { createReminderAction } from "@/app/actions/followups";

export function CreateReminderButton({
  leadId,
  defaults,
  triggerLabel = "Create reminder",
  variant = "outline",
  size = "sm",
}: {
  leadId: string;
  defaults?: {
    channel?: FollowupChannel;
    subject?: string;
    body?: string;
    scheduledFor?: string;
  };
  triggerLabel?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createReminderAction({
        leadId,
        channel: (formData.get("channel") as FollowupChannel) ?? "email",
        subject: String(formData.get("subject") ?? "") || null,
        body: String(formData.get("body") ?? "") || null,
        scheduledFor: (formData.get("scheduledFor") as string) || null,
        updateLeadNextFollowUp: true,
      });
      if (result.ok) {
        toast.success("Reminder scheduled");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to create reminder");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={variant} size={size} />}>
        <CalendarPlus className="size-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create follow-up reminder</DialogTitle>
          <DialogDescription>
            Schedule the next touch. This also updates the lead&apos;s next follow-up date.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select name="channel" defaultValue={defaults?.channel ?? "email"}>
                <SelectTrigger id="channel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOWUP_CHANNELS.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledFor">Date</Label>
              <Input
                id="scheduledFor"
                name="scheduledFor"
                type="date"
                min={todayISODate()}
                defaultValue={defaults?.scheduledFor ?? addDaysISO(todayISODate(), 3)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject / summary</Label>
            <Input
              id="subject"
              name="subject"
              defaultValue={defaults?.subject ?? ""}
              placeholder="e.g. Follow up on proposal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message (optional)</Label>
            <Textarea id="body" name="body" rows={3} defaultValue={defaults?.body ?? ""} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
