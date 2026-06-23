import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  accent?: "default" | "warning" | "danger" | "success";
}) {
  const accentClass =
    accent === "warning"
      ? "text-zinc-700 dark:text-zinc-300"
      : accent === "danger"
        ? "text-rose-600 dark:text-rose-400"
        : accent === "success"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground";

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
        <div className={cn("rounded-md p-2", accentClass)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
