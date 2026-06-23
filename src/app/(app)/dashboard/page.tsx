import Link from "next/link";
import { AlarmClock, ArrowRight, DollarSign, Flame, Snowflake } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import { computeMetrics, computeRevenueAtRisk } from "@/lib/followups";
import { formatCurrency } from "@/lib/format";
import { getInboxBrainStatusAction } from "@/app/actions/inbox";
import { getGmailConnectionStatus } from "@/lib/gmail/connection";
import { partitionLeadsForDashboard } from "@/lib/sample-leads";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardQuickActions } from "@/components/dashboard-quick-actions";
import { SampleDataBanner } from "@/components/sample-data-banner";
import { RevenueHero } from "@/components/dashboard/revenue-hero";
import { FollowUpTable } from "@/components/dashboard/follow-up-table";
import { TodayFocusWidget } from "@/components/dashboard/today-focus-widget";
import {
  EmailBrainInboxPanel,
  EmailBrainWidget,
} from "@/components/dashboard/email-brain-widget";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";
import { RecentActivityPanel } from "@/components/dashboard/recent-activity-panel";
import { FollowUpTrend } from "@/components/dashboard/follow-up-trend";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const repo = getRepository();
  const [allLeads, activity, inboxBrain, gmailStatus] = await Promise.all([
    repo.listLeads(user.id),
    repo.listRecentActivity(user.id, 10),
    getInboxBrainStatusAction(),
    getGmailConnectionStatus(user.id).catch(() => null),
  ]);

  const hasGmailData =
    inboxBrain.stats.totalThreads > 0 ||
    (inboxBrain.gmailConnected && inboxBrain.lastSyncedAt != null);

  const { leads, hiddenSampleCount, showRemoveSampleBanner } = partitionLeadsForDashboard(
    allLeads,
    { hasGmailData }
  );

  const metrics = computeMetrics(leads);
  const revenue = computeRevenueAtRisk(leads);
  const firstName = (user.fullName ?? "there").split(" ")[0];
  const hasLeads = leads.length > 0;
  const gmailConnected = inboxBrain.gmailConnected;

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Welcome back, {firstName} 👋
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {hasLeads && revenue.total > 0
              ? `You have ${formatCurrency(revenue.total)} in warm leads waiting for follow-up today.`
              : gmailConnected
                ? "Your inbox is synced — add leads or review Email Brain for follow-ups."
                : "Turn warm leads into next conversations."}
          </p>
        </div>
        <DashboardQuickActions
          hasLeads={hasLeads}
          gmailConnected={gmailConnected}
          gmailEmail={gmailStatus?.email}
        />
      </div>

      {showRemoveSampleBanner && <SampleDataBanner count={hiddenSampleCount} />}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {hasLeads && <RevenueHero leads={leads} />}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="Revenue needing attention"
              value={metrics.revenueAtRisk > 0 ? formatCurrency(metrics.revenueAtRisk) : "—"}
              icon={DollarSign}
              accent="warning"
              hint="Open deals in queue"
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
            />
            <MetricCard
              label="Stale leads"
              value={metrics.stale}
              icon={Snowflake}
              accent="default"
            />
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Follow up now</h2>
              {hasLeads && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600"
                  nativeButton={false}
                  render={<Link href="/leads" />}
                >
                  All leads
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
            <FollowUpTable
              leads={leads}
              limit={8}
              gmailConnected={gmailConnected}
            />
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecentActivityPanel activity={activity} />
            <FollowUpTrend activity={activity} />
          </div>

          <EmailBrainInboxPanel status={inboxBrain} />
        </div>

        <aside className="space-y-4">
          <TodayFocusWidget leads={leads} />
          <EmailBrainWidget status={inboxBrain} />
          <PipelineOverview leads={leads} />
        </aside>
      </div>
    </div>
  );
}
