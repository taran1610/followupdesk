import "server-only";
import { generateFollowUp } from "@/lib/ai/generate";
import type { CategorizedThread } from "@/lib/inbox/categorize";
import type { Lead } from "@/lib/types";

export async function generateFollowUpDraftForThread(
  thread: CategorizedThread,
  lead: Lead | null
): Promise<{ subject: string; body: string }> {
  const leadName =
    lead?.name ?? thread.counterpartyName ?? thread.counterpartyEmail.split("@")[0];

  const goal =
    thread.category === "gone_quiet"
      ? "revive_stale"
      : thread.category === "follow_up"
        ? "follow_up_proposal"
        : thread.category === "new_inquiry"
          ? "book_call"
          : "check_in";

  const emailContext = [
    `Email thread subject: ${thread.subject}`,
    `Latest message (${thread.direction}): ${thread.snippet}`,
    thread.categoryReason,
  ].join("\n");

  const result = await generateFollowUp({
    leadName,
    businessType: lead?.company ?? "",
    status: lead?.status ?? "New",
    notes: [lead?.notes, emailContext].filter(Boolean).join("\n\n"),
    tone: "friendly",
    goal,
    emailContext,
  });

  return {
    subject: result.output.subject,
    body: result.output.body,
  };
}

export function formatThreadsForAiContext(
  threads: Array<{ subject: string | null; snippet: string | null; direction: string; lastMessageAt: string }>
): string {
  if (threads.length === 0) return "";
  return threads
    .slice(0, 5)
    .map(
      (t, i) =>
        `[${i + 1}] ${t.direction === "inbound" ? "They wrote" : "You wrote"} (${t.lastMessageAt.slice(0, 10)}): ${t.subject ?? "No subject"} — ${t.snippet ?? ""}`
    )
    .join("\n");
}
