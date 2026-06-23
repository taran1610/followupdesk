"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { syncInboxAction } from "@/app/actions/inbox";
import { relativeFromNow } from "@/lib/date";
import type { GmailSyncStatus } from "@/lib/inbox/store";

export function SyncInboxButton({
  syncStatus,
  gmailConnected,
}: {
  syncStatus: GmailSyncStatus;
  gmailConnected: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!gmailConnected) return null;

  function handleSync() {
    startTransition(async () => {
      const result = await syncInboxAction();
      if (result.ok) {
        toast.success(`Synced ${result.threadsSynced ?? 0} email threads`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Sync failed");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {syncStatus.lastSyncedAt && (
        <p className="text-muted-foreground text-sm">
          Inbox synced {relativeFromNow(syncStatus.lastSyncedAt)}
          {syncStatus.threadsSynced > 0 ? ` · ${syncStatus.threadsSynced} threads` : ""}
        </p>
      )}
      <Button variant="outline" size="sm" onClick={handleSync} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        Sync inbox
      </Button>
    </div>
  );
}
