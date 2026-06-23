"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { markContactedAction } from "@/app/actions/leads";
import {
  buildFollowUpQueue,
  daysSinceContact,
  explainFollowUp,
} from "@/lib/followups";
import { formatCurrency } from "@/lib/format";
import { avatarColor, leadInitials } from "@/lib/initials";
import type { Lead } from "@/lib/types";
import { DashboardEmptyState } from "@/components/dashboard-empty-state";

export function FollowUpTable({
  leads,
  limit = 8,
  gmailConnected = false,
}: {
  leads: Lead[];
  limit?: number;
  gmailConnected?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (leads.length === 0) {
    return <DashboardEmptyState gmailConnected={gmailConnected} />;
  }

  const queue = buildFollowUpQueue(leads).slice(0, limit);

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
        <CheckCircle2 className="size-8 text-emerald-500" />
        <p className="font-medium">You&apos;re all caught up</p>
        <p className="text-muted-foreground text-sm">
          No leads need a follow-up right now.
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

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Stage</TableHead>
            <TableHead className="hidden font-medium sm:table-cell">Deal value</TableHead>
            <TableHead className="hidden font-medium md:table-cell">Last contact</TableHead>
            <TableHead className="font-medium">Why now</TableHead>
            <TableHead className="text-right font-medium">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queue.map(({ lead, reason }) => {
            const since = daysSinceContact(lead);
            const why = explainFollowUp(lead);

            return (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(lead.name)}`}
                    >
                      {leadInitials(lead.name)}
                    </div>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {lead.dealValue ? formatCurrency(lead.dealValue) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                  {since === null
                    ? "Never"
                    : since === 0
                      ? "Today"
                      : `${since} day${since === 1 ? "" : "s"} ago`}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {reason}
                  </span>
                  <span className="text-muted-foreground hidden text-xs lg:block">
                    {why.suggestedAction}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      nativeButton={false}
                      render={<Link href={`/leads/${lead.id}#draft-follow-up`} />}
                    >
                      <Sparkles className="size-3.5" />
                      <span className="hidden sm:inline">Draft</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => handleMarkDone(lead.id)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      <span className="hidden sm:inline">Done</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
