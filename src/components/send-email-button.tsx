"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sendFollowUpEmailAction } from "@/app/actions/gmail";

export function SendEmailButton({
  leadId,
  leadEmail,
  subject,
  body,
  suggestedNextFollowUpDate,
  gmailConnected,
}: {
  leadId: string;
  leadEmail: string | null;
  subject: string;
  body: string;
  suggestedNextFollowUpDate: string;
  gmailConnected: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!leadEmail) {
    return (
      <Button variant="outline" size="sm" disabled title="Add an email to this lead first">
        <Mail className="size-4" />
        No lead email
      </Button>
    );
  }

  if (!gmailConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href="/settings" />}
      >
        <Mail className="size-4" />
        Connect Gmail to send
      </Button>
    );
  }

  function handleSend() {
    startTransition(async () => {
      const result = await sendFollowUpEmailAction({
        leadId,
        subject,
        body,
        suggestedNextFollowUpDate,
      });
      if (result.ok) {
        toast.success(`Email sent to ${leadEmail}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not send email");
      }
    });
  }

  return (
    <Button size="sm" onClick={handleSend} disabled={isPending || !subject.trim() || !body.trim()}>
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      Send from Gmail
    </Button>
  );
}
