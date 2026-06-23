"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Mail, Plus, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { connectGmailAction } from "@/app/actions/gmail";
import { syncInboxAction } from "@/app/actions/inbox";

export function DashboardQuickActions({
  hasLeads,
  gmailConnected,
  gmailEmail,
}: {
  hasLeads: boolean;
  gmailConnected: boolean;
  gmailEmail?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSync() {
    startTransition(async () => {
      const result = await syncInboxAction();
      if (result.ok) {
        toast.success(`Synced ${result.threadsSynced ?? 0} threads`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Sync failed");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <LeadFormDialog
        trigger={
          <Button size="sm">
            <Plus className="size-4" />
            Add lead
          </Button>
        }
      />
      {!gmailConnected && (
        <form action={connectGmailAction}>
          <Button size="sm" variant="outline" type="submit">
            <Mail className="size-4" />
            Connect Gmail
          </Button>
        </form>
      )}
      {gmailConnected && (
        <Button size="sm" variant="outline" onClick={handleSync} disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Sync inbox
        </Button>
      )}
      {hasLeads && (
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/leads?filter=stale" />}
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
