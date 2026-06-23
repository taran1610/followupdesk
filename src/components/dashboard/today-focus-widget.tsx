import Link from "next/link";
import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeTodayFocus } from "@/lib/followups";
import type { Lead } from "@/lib/types";

const FOCUS_ITEMS = [
  { key: "proposalCount" as const, label: "Proposal follow-up", color: "bg-zinc-900" },
  { key: "newCount" as const, label: "New lead outreach", color: "bg-zinc-600" },
  { key: "staleCount" as const, label: "Stale lead revive", color: "bg-zinc-400" },
];

export function TodayFocusWidget({ leads }: { leads: Lead[] }) {
  const focus = computeTodayFocus(leads);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 text-foreground" />
          Today&apos;s focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {focus.totalToday === 0 ? (
          <p className="text-muted-foreground">
            No urgent follow-ups. Sync Gmail or add leads to get recommendations.
          </p>
        ) : (
          <>
            <p>
              You have <strong>{focus.totalToday}</strong> follow-up
              {focus.totalToday === 1 ? "" : "s"} needing attention.
            </p>
            <ul className="space-y-2">
              {FOCUS_ITEMS.filter(({ key }) => focus[key] > 0).map(({ key, label, color }) => (
                <li key={key} className="flex items-center gap-2.5">
                  <span className={`size-2 shrink-0 rounded-full ${color}`} />
                  <span className="flex-1">{label}</span>
                  <span className="text-muted-foreground tabular-nums">{focus[key]}</span>
                </li>
              ))}
            </ul>
            {focus.topLead && (
              <Link
                href={`/leads/${focus.topLead.lead.id}#draft-follow-up`}
                className="text-foreground hover:underline text-xs font-medium"
              >
                Start with {focus.topLead.lead.name} →
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
