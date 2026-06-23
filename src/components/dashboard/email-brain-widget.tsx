"use client";

import { useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { syncInboxAction, type InboxBrainStatus } from "@/app/actions/inbox";
import { connectGmailAction } from "@/app/actions/gmail";
import { relativeFromNow } from "@/lib/date";

const CATEGORY_ROWS = [
  { key: "needsReply" as const, label: "Needs reply", color: "bg-zinc-900" },
  { key: "waiting" as const, label: "Waiting on them", color: "bg-zinc-600" },
  { key: "goneQuiet" as const, label: "Gone quiet", color: "bg-zinc-400" },
  { key: "newInquiries" as const, label: "New inquiries", color: "bg-zinc-700" },
];

function categoryCounts(status: InboxBrainStatus) {
  return {
    needsReply: status.stats.needsReply,
    waiting: status.stats.waitingOnThem,
    goneQuiet: status.stats.goneQuiet,
    newInquiries: status.stats.newInquiries,
  };
}

export function EmailBrainWidget({ status }: { status: InboxBrainStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const autoSynced = useRef(false);

  useEffect(() => {
    if (
      !autoSynced.current &&
      status.gmailConnected &&
      !status.lastSyncedAt &&
      !status.lastSyncError
    ) {
      autoSynced.current = true;
      startTransition(async () => {
        const result = await syncInboxAction();
        if (result.ok) router.refresh();
      });
    }
  }, [status.gmailConnected, status.lastSyncedAt, status.lastSyncError, router]);

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

  if (!status.gmailConnected) {
    return (
      <Card id="inbox">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="size-4 text-foreground" />
            Email Brain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Connect Gmail to categorize inbox threads and draft follow-ups.
          </p>
          <form action={connectGmailAction}>
            <Button type="submit" size="sm" className="w-full">
              <Mail className="size-4" />
              Connect Gmail
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  const counts = categoryCounts(status);
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <Card id="inbox">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="size-4 text-foreground" />
          Email Brain
        </CardTitle>
        <Button variant="ghost" size="icon" className="size-7" onClick={handleSync} disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {status.lastSyncedAt && (
          <p className="text-muted-foreground text-xs">
            Synced {relativeFromNow(status.lastSyncedAt)} · {status.stats.totalThreads} threads
          </p>
        )}
        {status.lastSyncError && (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {status.lastSyncError}
          </p>
        )}
        <ul className="space-y-2.5">
          {CATEGORY_ROWS.map(({ key, label, color }) => (
            <li key={key} className="flex items-center gap-3 text-sm">
              <span className={`size-2 shrink-0 rounded-full ${color}`} />
              <span className="flex-1">{label}</span>
              <div className="flex items-center gap-2">
                <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${Math.round((counts[key] / maxCount) * 100)}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-4 text-right tabular-nums text-xs">
                  {counts[key]}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-foreground"
          nativeButton={false}
          render={<Link href="/dashboard#inbox-full" />}
        >
          Open inbox →
        </Button>
      </CardContent>
    </Card>
  );
}

/** Full-width inbox queue — shown below the fold when user clicks Open inbox. */
export function EmailBrainInboxPanel({ status }: { status: InboxBrainStatus }) {
  if (!status.gmailConnected || status.queue.length === 0) return null;

  return (
    <section id="inbox-full" className="scroll-mt-6 space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Inbox queue</h2>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {status.queue.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-medium">{item.subject ?? "(No subject)"}</p>
              <p className="text-muted-foreground text-sm">
                {item.categoryLabel} · {item.counterpartyName ?? item.counterpartyEmail}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                item.leadId ? (
                  <Link href={`/leads/${item.leadId}`} />
                ) : (
                  <Link href={`/leads?new=${encodeURIComponent(item.counterpartyEmail)}`} />
                )
              }
            >
              {item.leadId ? "Review" : "Add lead"}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
