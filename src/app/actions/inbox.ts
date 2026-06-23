"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getGmailConnectionStatus } from "@/lib/gmail/connection";
import { isSupabaseConfigured } from "@/lib/config";
import { syncInboxForUser } from "@/lib/inbox/sync";
import {
  getGmailSyncStatus,
  listInboxThreads,
  listInboxThreadsForLead,
} from "@/lib/inbox/store";
import {
  INBOX_CATEGORY_LABELS,
  type InboxCategory,
} from "@/lib/inbox/categorize";
import type { InboxThreadRow } from "@/lib/inbox/store";
import type { ActionResult } from "./leads";

export interface InboxQueueItem {
  id: string;
  subject: string | null;
  snippet: string | null;
  category: InboxCategory;
  categoryLabel: string;
  categoryReason: string | null;
  leadId: string | null;
  counterpartyName: string | null;
  counterpartyEmail: string;
  lastMessageAt: string;
  draftSubject: string | null;
  draftBody: string | null;
  urgencyScore: number;
}

export interface InboxBrainStatus {
  gmailConnected: boolean;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  threadsSynced: number;
  queue: InboxQueueItem[];
  stats: {
    totalThreads: number;
    matchedLeads: number;
    needsReply: number;
    newInquiries: number;
    realConversations: number;
  };
}

function mapQueueItem(row: InboxThreadRow): InboxQueueItem {
  return {
    id: row.id,
    subject: row.subject,
    snippet: row.snippet,
    category: row.category,
    categoryLabel: INBOX_CATEGORY_LABELS[row.category],
    categoryReason: row.categoryReason,
    leadId: row.leadId,
    counterpartyName: row.counterpartyName,
    counterpartyEmail: row.counterpartyEmail,
    lastMessageAt: row.lastMessageAt,
    draftSubject: row.draftSubject,
    draftBody: row.draftBody,
    urgencyScore: row.urgencyScore,
  };
}

export async function getInboxBrainStatusAction(): Promise<InboxBrainStatus> {
  const user = await requireUser();
  if (!isSupabaseConfigured()) {
    return {
      gmailConnected: false,
      lastSyncedAt: null,
      lastSyncError: null,
      threadsSynced: 0,
      queue: [],
      stats: {
        totalThreads: 0,
        matchedLeads: 0,
        needsReply: 0,
        newInquiries: 0,
        realConversations: 0,
      },
    };
  }

  const [connection, syncStatus, threads] = await Promise.all([
    getGmailConnectionStatus(user.id),
    getGmailSyncStatus().catch(() => ({
      lastSyncedAt: null,
      lastSyncError: null,
      threadsSynced: 0,
    })),
    listInboxThreads(50).catch(() => []),
  ]);

  const categoryPriority: Record<string, number> = {
    needs_reply: 0,
    new_inquiry: 1,
    follow_up: 2,
    gone_quiet: 3,
    waiting_on_them: 4,
    other: 5,
  };

  const queue = threads
    .filter((t) => t.category !== "other" && t.urgencyScore > 0)
    .filter((t) => t.category !== "waiting_on_them" || t.urgencyScore >= 50)
    .sort((a, b) => {
      const catDiff =
        (categoryPriority[a.category] ?? 99) - (categoryPriority[b.category] ?? 99);
      if (catDiff !== 0) return catDiff;
      return b.urgencyScore - a.urgencyScore;
    })
    .slice(0, 12)
    .map(mapQueueItem);

  const actionable = threads.filter((t) => t.category !== "other" && t.urgencyScore > 0);

  return {
    gmailConnected: Boolean(connection),
    lastSyncedAt: syncStatus.lastSyncedAt,
    lastSyncError: syncStatus.lastSyncError,
    threadsSynced: syncStatus.threadsSynced || threads.length,
    queue,
    stats: {
      totalThreads: threads.length,
      matchedLeads: threads.filter((t) => t.leadId).length,
      needsReply: actionable.filter((t) => t.category === "needs_reply").length,
      newInquiries: actionable.filter((t) => t.category === "new_inquiry").length,
      realConversations: actionable.length,
    },
  };
}

export async function syncInboxAction(): Promise<
  ActionResult & { threadsSynced?: number; needsReply?: number; newInquiries?: number }
> {
  const user = await requireUser();

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Sign in with a full account to sync inbox." };
  }

  const connection = await getGmailConnectionStatus(user.id);
  if (!connection) {
    return { ok: false, error: "Connect Gmail in Settings first." };
  }

  try {
    const result = await syncInboxForUser(user.id);
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/leads");
    return { ok: true, ...result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Inbox sync failed.";
    const { updateSyncState } = await import("@/lib/inbox/store");
    try {
      await updateSyncState(user.id, { lastSyncError: message });
    } catch {
      // ignore
    }
    return { ok: false, error: message };
  }
}

export async function getLeadEmailThreadsAction(leadId: string) {
  await requireUser();
  try {
    return await listInboxThreadsForLead(leadId);
  } catch {
    return [];
  }
}
