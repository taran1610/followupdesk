"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import type { ActionResult } from "./leads";

export async function addNoteAction(
  leadId: string,
  content: string
): Promise<ActionResult> {
  const user = await requireUser();
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };
  try {
    await getRepository().addNote(user.id, leadId, trimmed);
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/dashboard");
    return { ok: true, id: leadId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to add note." };
  }
}
