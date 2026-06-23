import "server-only";
import type { Lead } from "@/lib/types";
import { getRepository } from "@/lib/data";
import { fetchRecentThreads } from "@/lib/gmail/read";
import { getValidGmailAccessToken } from "@/lib/gmail/connection";
import {
  buildCategorizedThreads,
  type CategorizedThread,
} from "@/lib/inbox/categorize";
import { upsertInboxThreads, updateSyncState } from "@/lib/inbox/store";
import { generateFollowUpDraftForThread } from "@/lib/inbox/draft";

export interface SyncInboxResult {
  threadsSynced: number;
  needsReply: number;
  newInquiries: number;
}

export async function syncInboxForUser(userId: string): Promise<SyncInboxResult> {
  const { accessToken, email } = await getValidGmailAccessToken(userId);
  const repo = getRepository();

  let threads;
  try {
    threads = await fetchRecentThreads(accessToken, email, 80);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gmail sync failed";
    if (/insufficient|403|permission|scope|denied/i.test(message)) {
      throw new Error(
        "Gmail read access not granted. Disconnect and reconnect Gmail in Settings to enable Email Brain."
      );
    }
    throw err;
  }

  const leads = await repo.listLeads(userId);
  const categorized = buildCategorizedThreads(threads, leads);
  const withDrafts = await attachDrafts(categorized, leads);

  const count = await upsertInboxThreads(
    userId,
    withDrafts.map((t) => ({
      gmailThreadId: t.gmailThreadId,
      leadId: t.leadId,
      subject: t.subject,
      snippet: t.snippet,
      fromEmail: t.fromEmail,
      fromName: t.fromName,
      counterpartyEmail: t.counterpartyEmail,
      counterpartyName: t.counterpartyName,
      lastMessageAt: t.lastMessageAt,
      direction: t.direction,
      category: t.category,
      categoryReason: t.categoryReason,
      urgencyScore: t.urgencyScore,
      draftSubject: t.draftSubject ?? null,
      draftBody: t.draftBody ?? null,
    }))
  );

  await updateSyncState(userId, {
    lastSyncedAt: new Date().toISOString(),
    lastSyncError: null,
    threadsSynced: count,
  });

  return {
    threadsSynced: count,
    needsReply: withDrafts.filter((t) => t.category === "needs_reply").length,
    newInquiries: withDrafts.filter(
      (t) => t.category === "new_inquiry" && t.urgencyScore > 0
    ).length,
  };
}

async function attachDrafts(
  threads: CategorizedThread[],
  leads: Lead[]
): Promise<Array<CategorizedThread & { draftSubject?: string; draftBody?: string }>> {
  const urgent = threads
    .filter((t) =>
      ["needs_reply", "new_inquiry", "follow_up", "gone_quiet"].includes(t.category)
    )
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 8);

  const draftMap = new Map<string, { subject: string; body: string }>();

  await Promise.all(
    urgent.map(async (thread) => {
      const lead = thread.leadId
        ? leads.find((l) => l.id === thread.leadId) ?? null
        : null;
      try {
        const draft = await generateFollowUpDraftForThread(thread, lead);
        draftMap.set(thread.gmailThreadId, draft);
      } catch {
        // Best-effort during sync.
      }
    })
  );

  return threads.map((t) => {
    const draft = draftMap.get(t.gmailThreadId);
    return draft ? { ...t, draftSubject: draft.subject, draftBody: draft.body } : t;
  });
}
