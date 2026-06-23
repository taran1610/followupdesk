"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import { isSupabaseConfigured, appOrigin } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GMAIL_OAUTH_SCOPES } from "@/lib/gmail/config";
import {
  deleteGmailConnection,
  getGmailConnectionStatus,
  getValidGmailAccessToken,
} from "@/lib/gmail/connection";
import { sendGmailMessage } from "@/lib/gmail/send";
import { addDaysISO, todayISODate } from "@/lib/date";
import type { ActionResult } from "./leads";

export interface GmailStatus {
  configured: boolean;
  connected: boolean;
  email: string | null;
  connectedAt: string | null;
}

export async function getGmailStatusAction(): Promise<GmailStatus> {
  const user = await requireUser();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      configured: false,
      connected: false,
      email: null,
      connectedAt: null,
    };
  }

  const connection = await getGmailConnectionStatus(user.id);
  return {
    configured: true,
    connected: Boolean(connection),
    email: connection?.email ?? null,
    connectedAt: connection?.connectedAt ?? null,
  };
}

/** One-click Gmail connect via Supabase Google OAuth (same as sign-in). */
export async function connectGmailAction(): Promise<void> {
  await requireUser();

  if (!isSupabaseConfigured()) {
    redirect("/settings?gmail=unavailable");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes: GMAIL_OAUTH_SCOPES,
      redirectTo: `${appOrigin()}/auth/callback?gmail=connect`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    redirect(
      `/settings?gmail=error&reason=${encodeURIComponent(error?.message ?? "Could not connect Gmail")}`
    );
  }

  redirect(data.url);
}

export async function disconnectGmailAction(): Promise<ActionResult> {
  const user = await requireUser();
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Gmail requires a real account." };
  }

  try {
    await deleteGmailConnection(user.id);
    revalidatePath("/settings");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not disconnect Gmail.",
    };
  }
}

export interface SendFollowUpEmailArgs {
  leadId: string;
  subject: string;
  body: string;
  suggestedNextFollowUpDate?: string | null;
}

export async function sendFollowUpEmailAction(
  args: SendFollowUpEmailArgs
): Promise<ActionResult> {
  const user = await requireUser();

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Sign in with a real account to send email." };
  }

  const subject = args.subject.trim();
  const body = args.body.trim();
  if (!subject || !body) {
    return { ok: false, error: "Subject and body are required." };
  }

  const repo = getRepository();
  const lead = await repo.getLead(user.id, args.leadId);
  if (!lead) return { ok: false, error: "Lead not found." };
  if (!lead.email) {
    return { ok: false, error: "This lead has no email address." };
  }

  try {
    const { accessToken } = await getValidGmailAccessToken(user.id);
    await sendGmailMessage({
      accessToken,
      to: lead.email,
      subject,
      body,
    });

    const today = todayISODate();
    const nextFollowUp =
      args.suggestedNextFollowUpDate?.trim() || addDaysISO(today, 3);

    await repo.createFollowup(user.id, {
      leadId: args.leadId,
      channel: "email",
      subject,
      body,
      status: "sent",
      sentAt: new Date().toISOString(),
    });

    const patch: Parameters<typeof repo.updateLead>[2] = {
      lastContactDate: today,
      nextFollowUpDate: nextFollowUp,
    };
    if (lead.status === "New" || lead.status === "Stale") {
      patch.status = "Contacted";
    }
    await repo.updateLead(user.id, args.leadId, patch);

    revalidatePath(`/leads/${args.leadId}`);
    revalidatePath("/dashboard");
    revalidatePath("/leads");

    return { ok: true, id: args.leadId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
}
