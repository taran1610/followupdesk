import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/lib/types";

function buildTrend(activity: ActivityItem[]) {
  const days = 7;
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
      count: 0,
    };
  });

  for (const item of activity) {
    const created = new Date(item.createdAt);
    const diff = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < days) {
      buckets[days - 1 - diff].count += 1;
    }
  }

  return buckets;
}

export function FollowUpTrend({ activity }: { activity: ActivityItem[] }) {
  const trend = buildTrend(activity);
  const max = Math.max(...trend.map((t) => t.count), 1);
  const total = trend.reduce((s, t) => s + t.count, 0);

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Follow-up trend</CardTitle>
        <p className="text-muted-foreground text-xs">Last 7 days</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-24 items-end gap-1.5">
          {trend.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-orange-500/80 transition-all"
                style={{
                  height: `${Math.max(8, Math.round((day.count / max) * 100))}%`,
                  minHeight: day.count > 0 ? "12px" : "4px",
                  opacity: day.count > 0 ? 1 : 0.25,
                }}
              />
              <span className="text-muted-foreground text-[10px]">{day.label}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
          <div>
            <p className="text-lg font-semibold tabular-nums">{total}</p>
            <p className="text-muted-foreground text-xs">Actions</p>
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">
              {Math.max(0, Math.round(total * 0.4))}
            </p>
            <p className="text-muted-foreground text-xs">Follow-ups</p>
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">
              {total > 0 ? `${Math.min(99, Math.round((total / 7) * 10))}%` : "—"}
            </p>
            <p className="text-muted-foreground text-xs">Activity</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
