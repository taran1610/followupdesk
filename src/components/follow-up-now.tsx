import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { QuickContactButton } from "@/components/quick-contact-button";
import { Button } from "@/components/ui/button";
import { buildFollowUpQueue } from "@/lib/followups";
import { relativeDay } from "@/lib/date";
import type { Lead } from "@/lib/types";

export function FollowUpNow({ leads, limit }: { leads: Lead[]; limit?: number }) {
  const queue = buildFollowUpQueue(leads);
  const items = limit ? queue.slice(0, limit) : queue;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
        <CheckCircle2 className="text-emerald-500 size-7" />
        <p className="text-sm font-medium">You&apos;re all caught up</p>
        <p className="text-muted-foreground text-sm">
          No leads need a follow-up right now. Nice work.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border">
      {items.map(({ lead, reason }) => (
        <li
          key={lead.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/leads/${lead.id}`}
                className="truncate font-medium hover:underline"
              >
                {lead.name}
              </Link>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-muted-foreground mt-0.5 truncate text-sm">
              {reason}
              {lead.company ? ` · ${lead.company}` : ""}
              {lead.nextFollowUpDate ? ` · due ${relativeDay(lead.nextFollowUpDate)}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <QuickContactButton leadId={lead.id} />
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/leads/${lead.id}`} />}
            >
              Open
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
