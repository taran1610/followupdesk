"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import { todayISODate, addDaysISO } from "@/lib/date";
import type { LeadStatus, NewLeadInput, UpdateLeadInput } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function revalidateLead(leadId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/leads");
  if (leadId) revalidatePath(`/leads/${leadId}`);
}

function cleanInput<T extends NewLeadInput | UpdateLeadInput>(input: T): T {
  const trimmedOrNull = (v: unknown) => {
    if (typeof v !== "string") return v;
    const t = v.trim();
    return t === "" ? null : t;
  };
  const out: Record<string, unknown> = { ...input };
  for (const key of ["company", "email", "phone", "source", "notes", "lastContactDate", "nextFollowUpDate"]) {
    if (key in out) out[key] = trimmedOrNull(out[key]);
  }
  if ("name" in out && typeof out.name === "string") out.name = out.name.trim();
  if ("dealValue" in out) {
    const n = out.dealValue;
    out.dealValue = n === null || n === undefined || n === "" ? null : Number(n);
    if (Number.isNaN(out.dealValue as number)) out.dealValue = null;
  }
  return out as T;
}

export async function createLeadAction(input: NewLeadInput): Promise<ActionResult> {
  const user = await requireUser();
  const cleaned = cleanInput(input);
  if (!cleaned.name) return { ok: false, error: "Name is required." };
  try {
    const lead = await getRepository().createLead(user.id, cleaned);
    revalidateLead(lead.id);
    return { ok: true, id: lead.id };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function updateLeadAction(
  leadId: string,
  patch: UpdateLeadInput
): Promise<ActionResult> {
  const user = await requireUser();
  const cleaned = cleanInput(patch);
  if ("name" in cleaned && !cleaned.name) {
    return { ok: false, error: "Name is required." };
  }
  try {
    const lead = await getRepository().updateLead(user.id, leadId, cleaned);
    if (!lead) return { ok: false, error: "Lead not found." };
    revalidateLead(leadId);
    return { ok: true, id: leadId };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function deleteLeadAction(leadId: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await getRepository().deleteLead(user.id, leadId);
    revalidateLead();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function updateStatusAction(
  leadId: string,
  status: LeadStatus
): Promise<ActionResult> {
  return updateLeadAction(leadId, { status });
}

export async function markContactedAction(leadId: string): Promise<ActionResult> {
  const user = await requireUser();
  const repo = getRepository();
  const lead = await repo.getLead(user.id, leadId);
  if (!lead) return { ok: false, error: "Lead not found." };

  const today = todayISODate();
  const patch: UpdateLeadInput = {
    lastContactDate: today,
    nextFollowUpDate: addDaysISO(today, 3),
  };
  // Move very-early statuses forward when logging a touch.
  if (lead.status === "New" || lead.status === "Stale") {
    patch.status = "Contacted";
  }
  try {
    await repo.updateLead(user.id, leadId, patch);
    revalidateLead(leadId);
    return { ok: true, id: leadId };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function markWonAction(leadId: string): Promise<ActionResult> {
  return updateLeadAction(leadId, {
    status: "Won",
    lastContactDate: todayISODate(),
    nextFollowUpDate: null,
  });
}

export async function markLostAction(leadId: string): Promise<ActionResult> {
  return updateLeadAction(leadId, {
    status: "Lost",
    nextFollowUpDate: null,
  });
}

export async function updateFollowUpDatesAction(
  leadId: string,
  dates: { lastContactDate?: string | null; nextFollowUpDate?: string | null }
): Promise<ActionResult> {
  return updateLeadAction(leadId, dates);
}

export async function snoozeLeadAction(
  leadId: string,
  days = 3
): Promise<ActionResult> {
  const today = todayISODate();
  return updateLeadAction(leadId, { nextFollowUpDate: addDaysISO(today, days) });
}

function getSampleLeads(): NewLeadInput[] {
  const today = todayISODate();
  return [
    {
      name: "Sarah Johnson",
      company: "Johnson Coaching",
      email: "sarah@johnsoncoaching.com",
      status: "Proposal sent",
      source: "Referral",
      dealValue: 2500,
      notes: "Sent proposal 4 days ago. Waiting on sign-off from her partner.",
      lastContactDate: addDaysISO(today, -4),
      nextFollowUpDate: addDaysISO(today, -1),
    },
    {
      name: "Mike Agency",
      company: "Brightwave Marketing",
      email: "mike@brightwave.io",
      status: "Waiting",
      source: "Website",
      dealValue: 5500,
      notes: "Interested in a retainer. No reply in 12 days.",
      lastContactDate: addDaysISO(today, -12),
      nextFollowUpDate: today,
    },
    {
      name: "Alex Coach",
      company: "Summit Wellness",
      email: "alex@summitwellness.co",
      status: "Discovery booked",
      source: "Inbound",
      dealValue: 4000,
      notes: "Discovery call yesterday — send recap and next steps.",
      lastContactDate: addDaysISO(today, -1),
      nextFollowUpDate: today,
    },
    {
      name: "Marcus Rivera",
      company: "Rivera Studio",
      email: "marcus@riverastudio.design",
      status: "New",
      source: "Inbound",
      dealValue: 3500,
      notes: "Filled out contact form asking about brand strategy coaching.",
      nextFollowUpDate: today,
    },
    {
      name: "Helen Marsh",
      company: "Northpeak Consulting",
      email: "helen@northpeak.com",
      status: "Stale",
      source: "Event",
      dealValue: 12000,
      notes: "High-value lead gone quiet after strong first call.",
      lastContactDate: addDaysISO(today, -18),
      nextFollowUpDate: addDaysISO(today, -3),
    },
  ];
}

export async function loadSampleLeadsAction(): Promise<ActionResult & { count?: number }> {
  const user = await requireUser();
  const repo = getRepository();
  const existing = await repo.listLeads(user.id);
  if (existing.length > 0) {
    return { ok: false, error: "Sample leads are only available on an empty account." };
  }
  try {
    const samples = getSampleLeads();
    for (const sample of samples) {
      await repo.createLead(user.id, sample);
    }
    revalidateLead();
    return { ok: true, count: samples.length };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}
