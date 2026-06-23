import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeComingUp } from "@/lib/followups";
import type { Lead } from "@/lib/types";

export function ComingUp({ leads }: { leads: Lead[] }) {
  const rows = computeComingUp(leads);
  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4" />
          Coming up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y text-sm">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between py-2 first:pt-0">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium tabular-nums">
                {row.count} follow-up{row.count === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
