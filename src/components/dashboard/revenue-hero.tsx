import Link from "next/link";
import { DollarSign, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeRevenueAtRisk, buildFollowUpQueue, explainFollowUp } from "@/lib/followups";
import { formatCurrency } from "@/lib/format";
import type { Lead } from "@/lib/types";

export function RevenueHero({ leads }: { leads: Lead[] }) {
  const { total, breakdown } = computeRevenueAtRisk(leads);
  const topLead = buildFollowUpQueue(leads)[0];

  if (total <= 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100/80 p-5 dark:border-zinc-800 dark:from-zinc-900/40 dark:to-zinc-950/20">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
            <DollarSign className="size-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">
              {formatCurrency(total)} in warm leads need attention
            </p>
            <ul className="text-muted-foreground mt-2 space-y-0.5 text-sm">
              {breakdown.map((b) => (
                <li key={b.label}>
                  {formatCurrency(b.amount)} — {b.label.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {topLead && (
          <div className="min-w-[240px] rounded-lg border bg-background/70 p-4 shadow-sm lg:max-w-xs">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Suggested follow-up
            </p>
            <p className="mt-1 text-sm font-semibold">{topLead.lead.name}</p>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs italic">
              &ldquo;{explainFollowUp(topLead.lead).suggestedAction}&rdquo;
            </p>
            <Button
              className="mt-3 w-full"
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/leads/${topLead.lead.id}#draft-follow-up`} />
              }
            >
              <Sparkles className="size-4" />
              Use draft
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
