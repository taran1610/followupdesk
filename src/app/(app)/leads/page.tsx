import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import { LeadsTable } from "@/components/leads-table";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const user = await requireUser();
  const leads = await getRepository().listLeads(user.id);

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

      <LeadsTable leads={leads} />
    </div>
  );
}
