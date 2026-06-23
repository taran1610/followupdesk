"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Pencil,
  PhoneCall,
  Trash2,
  Trophy,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import type { Lead } from "@/lib/types";
import {
  deleteLeadAction,
  markContactedAction,
  markLostAction,
  markWonAction,
} from "@/app/actions/leads";

export function LeadActions({
  lead,
  align = "end",
}: {
  lead: Lead;
  align?: "start" | "end";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isClosed = lead.status === "Won" || lead.status === "Lost";

  function run(
    action: () => Promise<{ ok: boolean; error?: string }>,
    successMessage: string
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteLeadAction(lead.id);
      if (result.ok) {
        toast.success("Lead deleted");
        setDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="size-8" disabled={isPending} />
          }
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MoreHorizontal className="size-4" />
          )}
          <span className="sr-only">Lead actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer">
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          {!isClosed && (
            <DropdownMenuItem
              onClick={() => run(() => markContactedAction(lead.id), "Marked as contacted")}
              className="cursor-pointer"
            >
              <PhoneCall className="size-4" />
              Mark contacted
            </DropdownMenuItem>
          )}
          {!isClosed && (
            <>
              <DropdownMenuItem
                onClick={() => run(() => markWonAction(lead.id), "Marked as won")}
                className="cursor-pointer"
              >
                <Trophy className="size-4" />
                Mark won
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => run(() => markLostAction(lead.id), "Marked as lost")}
                className="cursor-pointer"
              >
                <XCircle className="size-4" />
                Mark lost
              </DropdownMenuItem>
            </>
          )}
          {isClosed && (
            <DropdownMenuItem
              onClick={() => run(() => markContactedAction(lead.id), "Reopened")}
              className="cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              Reopen as contacted
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LeadFormDialog lead={lead} open={editOpen} onOpenChange={setEditOpen} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete lead?</DialogTitle>
            <DialogDescription>
              This permanently removes {lead.name} and their notes and follow-ups. This
              can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
