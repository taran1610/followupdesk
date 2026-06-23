import Link from "next/link";
import { Activity, AlarmClock, MessageSquarePlus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { relativeFromNow } from "@/lib/date";
import type { ActivityItem, ActivityType } from "@/lib/types";

const ACTIVITY_ICON: Record<ActivityType, typeof Activity> = {
  lead_created: Plus,
  note_added: MessageSquarePlus,
  followup_scheduled: AlarmClock,
  status_changed: Activity,
  contacted: Activity,
  ai_generated: MessageSquarePlus,
};

export function RecentActivityPanel({ activity }: { activity: ActivityItem[] }) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Activity appears as you add leads, draft follow-ups, and sync Gmail.
          </p>
        ) : (
          <ul className="space-y-3">
            {activity.slice(0, 5).map((item) => {
              const Icon = ACTIVITY_ICON[item.type] ?? Activity;
              return (
                <li key={item.id} className="flex gap-3">
                  <div className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">
                      <Link href={`/leads/${item.leadId}`} className="font-medium hover:underline">
                        {item.leadName}
                      </Link>{" "}
                      <span className="text-muted-foreground">
                        {item.description.toLowerCase()}
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {relativeFromNow(item.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
