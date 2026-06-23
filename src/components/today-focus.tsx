import Link from "next/link";
import { Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeTodayFocus } from "@/lib/followups";
import { formatCurrency } from "@/lib/format";
import type { Lead } from "@/lib/types";

export function TodayFocus({ leads }: { leads: Lead[] }) {
  const focus = computeTodayFocus(leads);

  if (focus.totalToday === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4" />
            Today&apos;s focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No urgent follow-ups. Add leads or connect Gmail to get recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4" />
          Today&apos;s focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p>
          You have <strong>{focus.totalToday}</strong> follow-up
          {focus.totalToday === 1 ? "" : "s"} needing attention.
        </p>
        <ul className="text-muted-foreground space-y-1">
          {focus.proposalCount > 0 && (
            <li>{focus.proposalCount} proposal follow-up{focus.proposalCount === 1 ? "" : "s"}</li>
          )}
          {focus.staleCount > 0 && (
            <li>{focus.staleCount} stale lead{focus.staleCount === 1 ? "" : "s"}</li>
          )}
          {focus.newCount > 0 && (
            <li>{focus.newCount} new lead{focus.newCount === 1 ? "" : "s"}</li>
          )}
        </ul>

        {focus.topLead && (
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Recommended first
            </p>
            <p className="mt-1 font-semibold">{focus.topLead.lead.name}</p>
            <p className="text-muted-foreground text-xs">
              {focus.topLead.reason}
              {focus.topLead.lead.dealValue
                ? ` · ${formatCurrency(focus.topLead.lead.dealValue)}`
                : ""}
            </p>
            <Button
              className="mt-3 w-full"
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/leads/${focus.topLead.lead.id}#draft-follow-up`} />
              }
            >
              <Sparkles className="size-4" />
              Draft message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
