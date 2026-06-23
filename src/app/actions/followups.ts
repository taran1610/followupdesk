"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import type { FollowupChannel } from "@/lib/types";
import type { ActionResult } from "./leads";

export interface CreateReminderArgs {
  leadId: string;
  channel: FollowupChannel;
  subject?: string | null;
  body?: string | null;
  scheduledFor?: string | null; // ISO date or timestamp
  updateLeadNextFollowUp?: boolean;
}

export async function createReminderAction(
  args: CreateReminderArgs
): Promise<ActionResult> {
  const user = await requireUser();
  const repo = getRepository();
  try {
    const scheduledFor = normalizeSchedule(args.scheduledFor);
    await repo.createFollowup(user.id, {
      leadId: args.leadId,
      channel: args.channel,
      subject: args.subject ?? null,
      body: args.body ?? null,
      scheduledFor,
    });

    if (args.updateLeadNextFollowUp && scheduledFor) {
      await repo.updateLead(user.id, args.leadId, {
        nextFollowUpDate: scheduledFor.slice(0, 10),
      });
    }

    revalidatePath(`/leads/${args.leadId}`);
    revalidatePath("/dashboard");
    revalidatePath("/leads");
    return { ok: true, id: args.leadId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create reminder.",
    };
  }
}

function normalizeSchedule(value?: string | null): string | null {
  if (!value) return null;
  // Date-only -> treat as 9am that day for a sensible timestamp.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T09:00:00`).toISOString();
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
