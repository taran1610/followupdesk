"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addNoteAction } from "@/app/actions/notes";

export function AddNoteForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(formData: FormData) {
    const content = String(formData.get("content") ?? "");
    startTransition(async () => {
      const result = await addNoteAction(leadId, content);
      if (result.ok) {
        toast.success("Note added");
        if (ref.current) ref.current.value = "";
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to add note");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-2">
      <Textarea
        ref={ref}
        name="content"
        rows={3}
        placeholder="Log what happened — a call, an email reply, next steps…"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Add note
        </Button>
      </div>
    </form>
  );
}
