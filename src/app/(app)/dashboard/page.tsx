import Link from "next/link";
import {
  Activity,
  AlarmClock,
  ArrowRight,
  DollarSign,
  Flame,
  MessageSquarePlus,
  Plus,
  Snowflake,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import { computeMetrics, computeRevenueAtRisk } from "@/lib/followups";
import { relativeFromNow } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { getInboxBrainStatusAction } from "@/app/actions/inbox";
import { MetricCard } from "@/components/metric-card";
import { FollowUpQueue } from "@/components/follow-up-queue";
import { EmailBrainCard } from "@/components/email-brain-card";
import { DashboardQuickActions } from "@/components/dashboard-empty-state";
import { PipelineSnapshot } from "@/components/pipeline-snapshot";
import { TodayFocus } from "@/components/today-focus";
import { ComingUp } from "@/components/coming-up";
import { RevenueAtRiskBanner } from "@/components/revenue-at-risk-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActivityType } from "@/lib/types";

export const metadata = { title: "Dashboard" };

const ACTIVITY_ICON: Record<ActivityType, typeof Activity> = {
  lead_created: Plus,
  note_added: MessageSquarePlus,
  followup_scheduled: AlarmClock,
  status_changed: Activity,
  contacted: Activity,
  ai_generated: MessageSquarePlus,
};

export default async function DashboardPage() {
  const user = await requireUser();
  const repo = getRepository();
  const [leads, activity, inboxBrain] = await Promise.all([
    repo.listLeads(user.id),
    repo.listRecentActivity(user.id, 10),
    getInboxBrainStatusAction(),
  ]);
  const metrics = computeMetrics(leads);
  const revenue = computeRevenueAtRisk(leads);
  const firstName = (user.fullName ?? "there").split(" ")[0];
  const hasLeads = leads.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {hasLeads && revenue.total > 0
              ? `You have ${formatCurrency(revenue.total)} in warm leads waiting for follow-up today.`
              : "Turn warm leads into next conversations."}
          </p>
        </div>
        <DashboardQuickActions hasLeads={hasLeads} />
      </div>

      {hasLeads && <RevenueAtRiskBanner leads={leads} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Revenue needing attention"
          value={metrics.revenueAtRisk > 0 ? formatCurrency(metrics.revenueAtRisk) : "—"}
          icon={DollarSign}
          accent="warning"
          hint="Open deals in your follow-up queue"
        />
        <MetricCard
          label="Needs follow-up today"
          value={metrics.needsToday}
          icon={AlarmClock}
          accent="danger"
        />
        <MetricCard
          label="Hot leads"
          value={metrics.hot}
          icon={Flame}
          accent="warning"
          hint="Discovery or proposal stage"
        />
        <MetricCard
          label="Stale leads"
          value={metrics.stale}
          icon={Snowflake}
          accent="default"
          hint="No contact in 14+ days"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="space-y-3 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Follow up now</h2>
              <p className="text-muted-foreground text-sm">
                Prioritized by urgency — with reasons you can trust.
              </p>
            </div>
            {hasLeads && (
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/leads" />}
              >
                All leads
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
          <FollowUpQueue leads={leads} limit={8} />
        </section>

        <aside className="space-y-4">
          <TodayFocus leads={leads} />
          <ComingUp leads={leads} />
        </aside>
      </div>

      {hasLeads && <PipelineSnapshot leads={leads} />}

      <EmailBrainCard status={inboxBrain} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Latest updates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {activity.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Activity will appear here as you add leads, draft follow-ups, and sync
                Gmail.
              </p>
            ) : (
              <ul className="space-y-4">
                {activity.map((item) => {
                  const Icon = ACTIVITY_ICON[item.type] ?? Activity;
                  return (
                    <li key={item.id} className="flex gap-3">
                      <div className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm">
                          <Link
                            href={`/leads/${item.leadId}`}
                            className="font-medium hover:underline"
                          >
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
      </section>
    </div>
  );
}
