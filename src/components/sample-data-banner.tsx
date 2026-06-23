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
    <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950">
      <div className="flex gap-3">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" />
        <div className="text-sm">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Sample data is hidden — you have real Gmail data
          </p>
          <p className="text-amber-800/80 dark:text-amber-200/80">
            {count} demo leads (Sarah, Mike, Marcus, etc.) are still in your account.
            Remove them to keep your pipeline clean.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 border-amber-300 bg-white hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900"
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
