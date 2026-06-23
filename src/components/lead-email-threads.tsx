import Link from "next/link";
import { Mail, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INBOX_CATEGORY_LABELS } from "@/lib/inbox/categorize";
import type { InboxThreadRow } from "@/lib/inbox/store";
import { relativeFromNow } from "@/lib/date";

export function LeadEmailThreads({
  threads,
  leadId,
}: {
  threads: InboxThreadRow[];
  leadId: string;
}) {
  if (threads.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="size-4" />
          Email threads
        </CardTitle>
        <CardDescription>
          Synced from Gmail — used to draft smarter follow-ups. You approve every send.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {threads.map((thread) => (
            <li key={thread.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <div className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                <MessageSquare className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {thread.subject ?? "(No subject)"}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {INBOX_CATEGORY_LABELS[thread.category]}
                  </Badge>
                </div>
                {thread.snippet && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">{thread.snippet}</p>
                )}
                <p className="text-muted-foreground text-xs">
                  {thread.direction === "inbound" ? "They wrote" : "You wrote"} ·{" "}
                  {relativeFromNow(thread.lastMessageAt)}
                </p>
                {thread.draftSubject && (
                  <Link
                    href={`/leads/${leadId}#draft-follow-up`}
                    className="text-brand text-xs hover:underline"
                  >
                    Draft ready — scroll down to review & send
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
