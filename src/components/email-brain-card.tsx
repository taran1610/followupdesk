"use client";

import { useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { syncInboxAction, type InboxBrainStatus } from "@/app/actions/inbox";
import { connectGmailAction } from "@/app/actions/gmail";
import { relativeFromNow } from "@/lib/date";

const CATEGORY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  needs_reply: "destructive",
  new_inquiry: "default",
  follow_up: "secondary",
  gone_quiet: "outline",
  waiting_on_them: "outline",
  other: "outline",
};

export function EmailBrainCard({ status }: { status: InboxBrainStatus }) {
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
        toast.success(
          `Synced ${result.threadsSynced ?? 0} threads · ${result.needsReply ?? 0} need reply · ${result.newInquiries ?? 0} new inquiries`
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Sync failed");
      }
    });
  }

  if (!status.gmailConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="size-5" />
            Email Brain
          </CardTitle>
          <CardDescription>
            Unlock automatic follow-up detection from Gmail. You always approve before
            anything sends.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              { step: "1", label: "Connect Gmail", desc: "One-click OAuth" },
              { step: "2", label: "Sync conversations", desc: "Last 30 days" },
              { step: "3", label: "Get suggestions", desc: "Drafts + priorities" },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground text-xs">Step {item.step}</span>
                <p className="font-medium">{item.label}</p>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </li>
            ))}
          </ol>
          <form action={connectGmailAction}>
            <Button type="submit">
              <Mail className="size-4" />
              Connect Gmail
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="size-5" />
            Email Brain
          </CardTitle>
          <CardDescription>
            {status.lastSyncedAt ? (
              <>
                Last synced {relativeFromNow(status.lastSyncedAt)} ·{" "}
                {status.stats.totalThreads} threads in Gmail ·{" "}
                {status.stats.realConversations} real conversations
                {status.stats.matchedLeads > 0 &&
                  ` · ${status.stats.matchedLeads} matched to leads`}
              </>
            ) : (
              "Sync your inbox to categorize leads and draft follow-ups."
            )}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleSync} disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Sync inbox
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.lastSyncedAt && status.stats.totalThreads > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">{status.stats.totalThreads} synced</Badge>
            {status.stats.needsReply > 0 && (
              <Badge variant="destructive">{status.stats.needsReply} need reply</Badge>
            )}
            {status.stats.newInquiries > 0 && (
              <Badge variant="secondary">{status.stats.newInquiries} new inquiries</Badge>
            )}
            {status.stats.realConversations === 0 && (
              <span className="text-muted-foreground">
                Most synced threads are newsletters or automated — add leads with matching
                emails to see CRM matches.
              </span>
            )}
          </div>
        )}

        {status.lastSyncError && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {status.lastSyncError}
          </p>
        )}

        {status.queue.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
            {status.lastSyncedAt ? (
              status.stats.realConversations === 0 ? (
                <>
                  Gmail sync is working — {status.stats.totalThreads} threads imported.
                  <br />
                  No person-to-person conversations need follow-up yet. Try emailing a lead
                  from Gmail, or add leads whose email matches your inbox.
                </>
              ) : (
                "No threads need attention right now. Nice work."
              )
            ) : (
              "Click Sync inbox to analyze your recent Gmail threads."
            )}
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {status.queue.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={CATEGORY_VARIANT[item.category] ?? "outline"}>
                      {item.categoryLabel}
                    </Badge>
                    <span className="truncate font-medium">
                      {item.subject ?? "(No subject)"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {item.categoryReason}
                    {" · "}
                    {item.counterpartyName ?? item.counterpartyEmail}
                    {" · "}
                    {relativeFromNow(item.lastMessageAt)}
                  </p>
                  {item.snippet && (
                    <p className="text-muted-foreground line-clamp-2 text-xs">{item.snippet}</p>
                  )}
                  {item.draftSubject && (
                    <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                      <Sparkles className="size-3" />
                      Draft ready — review before sending
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {item.leadId ? (
                    <Button
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/leads/${item.leadId}`} />}
                    >
                      Review & send
                      <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/leads?new=${encodeURIComponent(item.counterpartyEmail)}`}
                        />
                      }
                    >
                      Add lead
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
