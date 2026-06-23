import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import { getInboxBrainStatusAction } from "@/app/actions/inbox";
import { partitionLeadsForDashboard } from "@/lib/sample-leads";
import { LeadsTable } from "@/components/leads-table";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { SampleDataBanner } from "@/components/sample-data-banner";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const user = await requireUser();
  const [allLeads, inboxBrain] = await Promise.all([
    getRepository().listLeads(user.id),
    getInboxBrainStatusAction(),
  ]);

  const hasGmailData =
    inboxBrain.stats.totalThreads > 0 ||
    (inboxBrain.gmailConnected && inboxBrain.lastSyncedAt != null);

  const { leads, hiddenSampleCount, showRemoveSampleBanner } = partitionLeadsForDashboard(
    allLeads,
    { hasGmailData }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-muted-foreground text-sm">
            Your pipeline of warm prospects and where each one stands.
          </p>
        </div>
        <LeadFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Add lead
            </Button>
          }
        />
      </div>

      {showRemoveSampleBanner && <SampleDataBanner count={hiddenSampleCount} />}

      <LeadsTable leads={leads} />
    </div>
  );
}
