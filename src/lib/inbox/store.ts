import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { InboxCategory } from "@/lib/inbox/categorize";

export interface InboxThreadRow {
  id: string;
  userId: string;
  gmailThreadId: string;
  leadId: string | null;
  subject: string | null;
  snippet: string | null;
  fromEmail: string;
  fromName: string | null;
  counterpartyEmail: string;
  counterpartyName: string | null;
  lastMessageAt: string;
  direction: string;
  category: InboxCategory;
  categoryReason: string | null;
  urgencyScore: number;
  draftSubject: string | null;
  draftBody: string | null;
  draftGeneratedAt: string | null;
  syncedAt: string;
}

export interface GmailSyncStatus {
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  threadsSynced: number;
}

function mapRow(row: Record<string, unknown>): InboxThreadRow {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    gmailThreadId: row.gmail_thread_id as string,
    leadId: (row.lead_id as string | null) ?? null,
    subject: (row.subject as string | null) ?? null,
    snippet: (row.snippet as string | null) ?? null,
    fromEmail: row.from_email as string,
    fromName: (row.from_name as string | null) ?? null,
    counterpartyEmail: row.counterparty_email as string,
    counterpartyName: (row.counterparty_name as string | null) ?? null,
    lastMessageAt: row.last_message_at as string,
    direction: row.direction as string,
    category: row.category as InboxCategory,
    categoryReason: (row.category_reason as string | null) ?? null,
    urgencyScore: Number(row.urgency_score ?? 0),
    draftSubject: (row.draft_subject as string | null) ?? null,
    draftBody: (row.draft_body as string | null) ?? null,
    draftGeneratedAt: (row.draft_generated_at as string | null) ?? null,
    syncedAt: row.synced_at as string,
  };
}

export async function getGmailSyncStatus(): Promise<GmailSyncStatus> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_gmail_sync_status");
  if (error) throw error;
  const row = (data as Record<string, unknown>[] | null)?.[0];
  return {
    lastSyncedAt: (row?.last_synced_at as string | null) ?? null,
    lastSyncError: (row?.last_sync_error as string | null) ?? null,
    threadsSynced: Number(row?.threads_synced ?? 0),
  };
}

export async function listInboxThreads(limit = 50): Promise<InboxThreadRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inbox_threads")
    .select("*")
    .order("urgency_score", { ascending: false })
    .order("last_message_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function listInboxThreadsForLead(leadId: string): Promise<InboxThreadRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inbox_threads")
    .select("*")
    .eq("lead_id", leadId)
    .order("last_message_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function upsertInboxThreads(
  userId: string,
  threads: Array<{
    gmailThreadId: string;
    leadId: string | null;
    subject: string;
    snippet: string;
    fromEmail: string;
    fromName: string | null;
    counterpartyEmail: string;
    counterpartyName: string | null;
    lastMessageAt: string;
    direction: string;
    category: InboxCategory;
    categoryReason: string;
    urgencyScore: number;
    draftSubject?: string | null;
    draftBody?: string | null;
  }>
): Promise<number> {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const rows = threads.map((t) => ({
    user_id: userId,
    gmail_thread_id: t.gmailThreadId,
    lead_id: t.leadId,
    subject: t.subject,
    snippet: t.snippet,
    from_email: t.fromEmail,
    from_name: t.fromName,
    counterparty_email: t.counterpartyEmail,
    counterparty_name: t.counterpartyName,
    last_message_at: t.lastMessageAt,
    direction: t.direction,
    category: t.category,
    category_reason: t.categoryReason,
    urgency_score: t.urgencyScore,
    draft_subject: t.draftSubject ?? null,
    draft_body: t.draftBody ?? null,
    draft_generated_at: t.draftSubject ? now : null,
    synced_at: now,
  }));

  if (rows.length === 0) return 0;

  const { error } = await admin.from("inbox_threads").upsert(rows, {
    onConflict: "user_id,gmail_thread_id",
  });
  if (error) throw error;
  return rows.length;
}

export async function updateSyncState(
  userId: string,
  args: {
    lastSyncedAt?: string | null;
    lastSyncError?: string | null;
    threadsSynced?: number;
  }
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("gmail_sync_state").upsert(
    {
      user_id: userId,
      last_synced_at: args.lastSyncedAt ?? null,
      last_sync_error: args.lastSyncError ?? null,
      threads_synced: args.threadsSynced ?? 0,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}
