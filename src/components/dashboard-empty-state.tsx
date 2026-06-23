"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Mail, Plus, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { connectGmailAction } from "@/app/actions/gmail";
import { loadSampleLeadsAction } from "@/app/actions/leads";

export function DashboardEmptyState() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSampleLeads() {
    startTransition(async () => {
      const result = await loadSampleLeadsAction();
      if (result.ok) {
        toast.success(`Added ${result.count ?? 5} sample leads`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not load samples");
      }
    });
  }

  return (
    <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold">Start your follow-up system</h3>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
        Add your first lead or connect Gmail to find warm conversations automatically.
        Or load sample leads to see how Email Brain prioritizes follow-ups.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={handleSampleLeads} disabled={isPending} variant="outline">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Users className="size-4" />}
          Add sample leads
        </Button>
        <LeadFormDialog
          trigger={
            <Button variant="outline">
              <Plus className="size-4" />
              Add real lead
            </Button>
          }
        />
        <form action={connectGmailAction}>
          <Button type="submit" variant="outline">
            <Mail className="size-4" />
            Connect Gmail
          </Button>
        </form>
      </div>
      <p className="text-muted-foreground mt-4 text-xs">
        Sample data includes Sarah — proposal overdue, Mike — no reply in 12 days, and more.
      </p>
    </div>
  );
}

export function DashboardQuickActions({ hasLeads }: { hasLeads: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <LeadFormDialog
        trigger={
          <Button size="sm" variant="outline">
            <Plus className="size-4" />
            Add lead
          </Button>
        }
      />
      <form action={connectGmailAction}>
        <Button size="sm" variant="outline" type="submit">
          <Mail className="size-4" />
          Connect Gmail
        </Button>
      </form>
      {hasLeads && (
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/leads" />}
        >
          View stale leads
        </Button>
      )}
      {hasLeads && (
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/leads" />}
        >
          <Sparkles className="size-4" />
          Draft follow-up
        </Button>
      )}
    </div>
  );
}
