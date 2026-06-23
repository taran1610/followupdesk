import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computePipeline } from "@/lib/followups";
import { formatCurrency } from "@/lib/format";
import type { Lead } from "@/lib/types";

export function PipelineSnapshot({ leads }: { leads: Lead[] }) {
  const stages = computePipeline(leads);
  if (stages.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Pipeline</CardTitle>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/leads" />}>
          View all
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {stages.map((stage) => (
            <div
              key={stage.status}
              className="rounded-lg border bg-muted/30 px-3 py-2.5"
            >
              <p className="text-muted-foreground truncate text-xs">{stage.status}</p>
              <p className="text-lg font-semibold tabular-nums">{stage.count}</p>
              <p className="text-muted-foreground text-xs">{formatCurrency(stage.value)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
