import Link from "next/link";
import { DollarSign, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeRevenueAtRisk, buildFollowUpQueue, explainFollowUp } from "@/lib/followups";
import { formatCurrency } from "@/lib/format";
import type { Lead } from "@/lib/types";

export function RevenueAtRiskBanner({ leads }: { leads: Lead[] }) {
  const { total, breakdown } = computeRevenueAtRisk(leads);
  const topLead = buildFollowUpQueue(leads)[0];

  if (total <= 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-amber-100 p-2 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            <DollarSign className="size-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {formatCurrency(total)} in warm leads need attention
            </p>
            <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
              {breakdown.map((b) => (
                <li key={b.label}>
                  {formatCurrency(b.amount)} — {b.label.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {topLead && (
          <div className="rounded-lg border bg-background/80 p-4">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Suggested follow-up for {topLead.lead.name}
            </p>
            <p className="mt-2 line-clamp-3 text-sm italic">
              &ldquo;{explainFollowUp(topLead.lead).suggestedAction}&rdquo;
            </p>
            <Button
              className="mt-3"
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
      </CardContent>
    </Card>
  );
}
