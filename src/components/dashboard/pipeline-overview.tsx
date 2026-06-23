import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computePipeline } from "@/lib/followups";
import { formatCurrency } from "@/lib/format";
import type { Lead } from "@/lib/types";

const STAGE_COLORS: Record<string, string> = {
  New: "bg-zinc-900",
  Contacted: "bg-zinc-700",
  "Discovery booked": "bg-zinc-600",
  "Proposal sent": "bg-zinc-500",
  Waiting: "bg-zinc-400",
  Stale: "bg-zinc-300",
  Won: "bg-zinc-800",
  Lost: "bg-zinc-400",
};

export function PipelineOverview({ leads }: { leads: Lead[] }) {
  const stages = computePipeline(leads);
  if (stages.length === 0) {
    return (
      <Card id="pipeline">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pipeline overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Add leads to see your pipeline breakdown.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...stages.map((s) => s.value), 1);
  const totalValue = stages.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card id="pipeline">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Pipeline overview</CardTitle>
        <Button variant="ghost" size="sm" className="h-7 px-2" nativeButton={false} render={<Link href="/leads" />}>
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-3">
          {stages.slice(0, 5).map((stage) => (
            <li key={stage.status}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{stage.status}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatCurrency(stage.value)}
                </span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full ${STAGE_COLORS[stage.status] ?? "bg-zinc-900"}`}
                  style={{ width: `${Math.round((stage.value / maxValue) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        {totalValue > 0 && (
          <p className="border-t pt-3 text-sm">
            <span className="text-muted-foreground">Total pipeline value</span>
            <span className="float-right font-semibold tabular-nums">
              {formatCurrency(totalValue)}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
