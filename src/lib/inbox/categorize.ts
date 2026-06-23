import "server-only";
import type { Lead } from "@/lib/types";
import type { ParsedGmailThread } from "@/lib/gmail/read";
import { isAutomatedSender } from "@/lib/inbox/filter";

export const INBOX_CATEGORIES = [
  "needs_reply",
  "waiting_on_them",
  "new_inquiry",
  "follow_up",
  "gone_quiet",
  "other",
] as const;

export type InboxCategory = (typeof INBOX_CATEGORIES)[number];

export const INBOX_CATEGORY_LABELS: Record<InboxCategory, string> = {
  needs_reply: "Needs your reply",
  waiting_on_them: "Waiting on them",
  new_inquiry: "New inquiry",
  follow_up: "Follow up",
  gone_quiet: "Gone quiet",
  other: "Other",
};

export interface CategorizedThread extends ParsedGmailThread {
  leadId: string | null;
  category: InboxCategory;
  categoryReason: string;
  urgencyScore: number;
}

export function matchLeadByEmail(leads: Lead[], email: string): Lead | null {
  const normalized = email.toLowerCase();
  return leads.find((l) => l.email?.toLowerCase() === normalized) ?? null;
}

export function categorizeThread(
  thread: ParsedGmailThread,
  lead: Lead | null,
  now: Date = new Date()
): Pick<CategorizedThread, "category" | "categoryReason" | "urgencyScore"> {
  const daysSince = daysSinceDate(thread.lastMessageAt, now);

  if (isAutomatedSender(thread.counterpartyEmail)) {
    return {
      category: "other",
      categoryReason: "Newsletter or automated message — skipped",
      urgencyScore: 0,
    };
  }

  if (!lead && thread.direction === "inbound") {
    return {
      category: "new_inquiry",
      categoryReason: "New sender — not in your leads yet",
      urgencyScore: 70,
    };
  }

  if (thread.direction === "inbound" && daysSince <= 3) {
    return {
      category: "needs_reply",
      categoryReason: lead
        ? `${lead.name} replied — draft a response`
        : "Inbound message needs a reply",
      urgencyScore: 85 - daysSince * 5,
    };
  }

  if (thread.direction === "outbound" && daysSince <= 5) {
    return {
      category: "waiting_on_them",
      categoryReason: lead
        ? `Waiting on ${lead.name} to respond`
        : "You sent this — waiting for a reply",
      urgencyScore: 30,
    };
  }

  if (daysSince >= 7) {
    const isClosed = lead?.status === "Won" || lead?.status === "Lost";
    if (!isClosed) {
      return {
        category: "gone_quiet",
        categoryReason: lead
          ? `No activity with ${lead.name} in ${daysSince} days`
          : `Thread quiet for ${daysSince} days`,
        urgencyScore: 55 + Math.min(daysSince, 20),
      };
    }
  }

  if (lead?.status === "Proposal sent" && daysSince >= 2) {
    return {
      category: "follow_up",
      categoryReason: "Proposal sent — time to follow up",
      urgencyScore: 75,
    };
  }

  if (lead?.status === "New" && thread.direction === "inbound") {
    return {
      category: "needs_reply",
      categoryReason: "New lead reached out — respond quickly",
      urgencyScore: 80,
    };
  }

  return {
    category: "follow_up",
    categoryReason: lead ? `Check in with ${lead.name}` : "Worth a follow-up",
    urgencyScore: 40,
  };
}

export function buildCategorizedThreads(
  threads: ParsedGmailThread[],
  leads: Lead[],
  now?: Date
): CategorizedThread[] {
  return threads.map((thread) => {
    const lead = matchLeadByEmail(leads, thread.counterpartyEmail);
    const { category, categoryReason, urgencyScore } = categorizeThread(
      thread,
      lead,
      now
    );
    return {
      ...thread,
      leadId: lead?.id ?? null,
      category,
      categoryReason,
      urgencyScore,
    };
  });
}

function daysSinceDate(iso: string, now: Date): number {
  const then = new Date(iso).getTime();
  return Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24));
}

export function buildInboxQueue(threads: CategorizedThread[]): CategorizedThread[] {
  const actionable: InboxCategory[] = [
    "needs_reply",
    "new_inquiry",
    "follow_up",
    "gone_quiet",
    "waiting_on_them",
    "other",
  ];

  return [...threads]
    .filter((t) => t.urgencyScore > 0 && t.category !== "other")
    .filter((t) => t.category !== "waiting_on_them" || t.urgencyScore >= 50)
    .sort((a, b) => {
      const catDiff =
        actionable.indexOf(a.category) - actionable.indexOf(b.category);
      if (catDiff !== 0) return catDiff;
      return b.urgencyScore - a.urgencyScore;
    });
}
