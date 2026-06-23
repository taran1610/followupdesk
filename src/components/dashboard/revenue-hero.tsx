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
    <div className="rounded-xl border border-orange-200/80 bg-gradient-to-r from-orange-50 to-amber-50/80 p-5 dark:border-orange-900/50 dark:from-orange-950/40 dark:to-amber-950/20">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300">
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
              className="mt-3 w-full bg-orange-600 hover:bg-orange-700"
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
