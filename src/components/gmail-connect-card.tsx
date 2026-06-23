"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Mail, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  connectGmailAction,
  disconnectGmailAction,
  type GmailStatus,
} from "@/app/actions/gmail";
import { formatDateTime } from "@/lib/date";

export function GmailConnectCard({
  status,
  banner,
}: {
  status: GmailStatus;
  banner?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConnect() {
    startTransition(async () => {
      await connectGmailAction();
    });
  }

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectGmailAction();
      if (result.ok) {
        toast.success("Gmail disconnected");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not disconnect");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="size-5" />
          Gmail
        </CardTitle>
        <CardDescription>
          Send follow-ups from your own address. Replies land in your normal inbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {banner && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {banner}
          </p>
        )}

        {!status.configured ? (
          <p className="text-muted-foreground text-sm">
            Sign in with a full account to connect Gmail and send follow-ups from
            Settings.
          </p>
        ) : status.connected && status.email ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
              <CheckCircle2 className="text-brand mt-0.5 size-5 shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Connected as {status.email}</p>
                {status.connectedAt && (
                  <p className="text-muted-foreground">
                    Connected {formatDateTime(status.connectedAt)}
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleDisconnect} disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Unplug className="size-4" />
              )}
              Disconnect Gmail
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Click below, choose your Google account, and approve send access. We
              never read your inbox — only send the follow-ups you approve.
            </p>
            <Button onClick={handleConnect} disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              Connect Gmail
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
