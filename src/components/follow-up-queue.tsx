"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  AlarmClock,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { markContactedAction, snoozeLeadAction } from "@/app/actions/leads";
import {
  buildFollowUpQueue,
  daysSinceContact,
  explainFollowUp,
} from "@/lib/followups";
import { formatCurrency } from "@/lib/format";
import { relativeDay } from "@/lib/date";
import type { Lead } from "@/lib/types";
import { DashboardEmptyState } from "@/components/dashboard-empty-state";

export function FollowUpQueue({
  leads,
  limit = 8,
}: {
  leads: Lead[];
  limit?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (leads.length === 0) {
    return <DashboardEmptyState />;
  }

  const queue = buildFollowUpQueue(leads).slice(0, limit);

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
        <CheckCircle2 className="size-7 text-emerald-500" />
        <p className="text-sm font-medium">You&apos;re all caught up</p>
        <p className="text-muted-foreground text-sm">
          No leads need a follow-up right now. Check back tomorrow or add more leads.
        </p>
      </div>
    );
  }

  function handleMarkDone(leadId: string) {
    startTransition(async () => {
      const result = await markContactedAction(leadId);
      if (result.ok) {
        toast.success("Marked as followed up");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not update lead");
      }
    });
  }

  function handleSnooze(leadId: string) {
    startTransition(async () => {
      const result = await snoozeLeadAction(leadId, 3);
      if (result.ok) {
        toast.success("Snoozed for 3 days");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not snooze");
      }
    });
  }

  return (
    <ul className="space-y-3">
      {queue.map(({ lead, reason }) => {
        const why = explainFollowUp(lead);
        const since = daysSinceContact(lead);

        return (
          <li
            key={lead.id}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-base font-semibold hover:underline"
                  >
                    {lead.name}
                  </Link>
                  <StatusBadge status={lead.status} />
                  {lead.dealValue ? (
                    <span className="text-muted-foreground text-sm font-medium">
                      {formatCurrency(lead.dealValue)}
                    </span>
                  ) : null}
                </div>

                <p className="text-sm">
                  <span className="font-medium text-rose-600 dark:text-rose-400">
                    {reason}
                  </span>
                  {since !== null && (
                    <span className="text-muted-foreground">
                      {" "}
                      · Last contact:{" "}
                      {since === 0 ? "today" : `${since} day${since === 1 ? "" : "s"} ago`}
                    </span>
                  )}
                  {lead.nextFollowUpDate && (
                    <span className="text-muted-foreground">
                      {" "}
                      · Due {relativeDay(lead.nextFollowUpDate)}
                    </span>
                  )}
                </p>

                <div className="bg-muted/50 flex gap-2 rounded-md p-3 text-sm">
                  <Lightbulb className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-medium">Why follow up?</p>
                    <p className="text-muted-foreground mt-0.5">{why.explanation}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Suggested: {why.suggestedAction}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/leads/${lead.id}#draft-follow-up`} />}
                >
                  <Sparkles className="size-4" />
                  Draft message
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkDone(lead.id)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  Mark followed up
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSnooze(lead.id)}
                  disabled={isPending}
                >
                  <AlarmClock className="size-4" />
                  Snooze 3d
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
