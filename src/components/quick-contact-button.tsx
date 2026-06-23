"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markContactedAction } from "@/app/actions/leads";

export function QuickContactButton({
  leadId,
  label = "Log touch",
}: {
  leadId: string;
  label?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await markContactedAction(leadId);
      if (result.ok) {
        toast.success("Logged a touch — next follow-up set for 3 days out");
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <PhoneCall className="size-4" />
      )}
      {label}
    </Button>
  );
}
