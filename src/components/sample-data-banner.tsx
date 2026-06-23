"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeSampleLeadsAction } from "@/app/actions/leads";

export function SampleDataBanner({ count }: { count: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeSampleLeadsAction();
      if (result.ok) {
        toast.success(`Removed ${result.count ?? count} sample leads`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not remove sample data");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex gap-3">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-zinc-700 dark:text-zinc-300" />
        <div className="text-sm">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            Sample data is hidden — you have real Gmail data
          </p>
          <p className="text-muted-foreground">
            {count} demo leads (Sarah, Mike, Marcus, etc.) are still in your account.
            Remove them to keep your pipeline clean.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0"
        onClick={handleRemove}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Remove sample data
      </Button>
    </div>
  );
}
