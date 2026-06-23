"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Loader2, Mail, Plus, RefreshCw, Sparkles } from "lucide-react";
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
          <Button size="sm" variant="outline">
            <Plus className="size-4" />
            Add lead
          </Button>
        }
      />
      {gmailConnected ? (
        <>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1 text-xs">
            <Check className="size-3.5 text-emerald-600" />
            Gmail: {gmailEmail ?? "connected"}
          </span>
          <Button size="sm" variant="outline" onClick={handleSync} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Sync inbox
          </Button>
        </>
      ) : (
        <form action={connectGmailAction}>
          <Button size="sm" variant="outline" type="submit">
            <Mail className="size-4" />
            Connect Gmail
          </Button>
        </form>
      )}
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
