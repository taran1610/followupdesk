import "server-only";
import { getHeader, extractEmailAddress, extractDisplayName } from "./parse";

const GMAIL_THREADS_URL = "https://gmail.googleapis.com/gmail/v1/users/me/threads";

export interface ParsedGmailThread {
  gmailThreadId: string;
  subject: string;
  snippet: string;
  fromRaw: string;
  fromEmail: string;
  fromName: string | null;
  toRaw: string;
  counterpartyEmail: string;
  counterpartyName: string | null;
  lastMessageAt: string;
  direction: "inbound" | "outbound";
}

interface GmailThreadListResponse {
  threads?: { id: string }[];
  nextPageToken?: string;
}

interface GmailThreadGetResponse {
  id: string;
  snippet?: string;
  messages?: {
    id: string;
    internalDate?: string;
    snippet?: string;
    payload?: {
      headers?: { name: string; value: string }[];
    };
  }[];
}

/** Fetch recent Gmail threads (last 30 days, up to maxResults). */
export async function fetchRecentThreads(
  accessToken: string,
  userEmail: string,
  maxResults = 80
): Promise<ParsedGmailThread[]> {
  const listUrl = new URL(GMAIL_THREADS_URL);
  listUrl.searchParams.set("maxResults", String(Math.min(maxResults, 100)));
  listUrl.searchParams.set("q", "newer_than:30d");

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const listData = (await listRes.json()) as GmailThreadListResponse & {
    error?: { message?: string };
  };

  if (!listRes.ok) {
    throw new Error(listData.error?.message ?? "Could not list Gmail threads.");
  }

  const threadIds = (listData.threads ?? []).map((t) => t.id).slice(0, maxResults);
  if (threadIds.length === 0) return [];

  const parsed: ParsedGmailThread[] = [];
  const normalizedUser = userEmail.toLowerCase();

  for (const threadId of threadIds) {
    try {
      const thread = await fetchThread(accessToken, threadId);
      const item = parseThread(thread, normalizedUser);
      if (item) parsed.push(item);
    } catch {
      // Skip individual thread failures during bulk sync.
    }
  }

  return parsed.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

async function fetchThread(
  accessToken: string,
  threadId: string
): Promise<GmailThreadGetResponse> {
  const url = `${GMAIL_THREADS_URL}/${threadId}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as GmailThreadGetResponse & {
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(data.error?.message ?? "Could not read Gmail thread.");
  }
  return data;
}

function parseThread(
  thread: GmailThreadGetResponse,
  userEmail: string
): ParsedGmailThread | null {
  const messages = thread.messages ?? [];
  if (messages.length === 0) return null;

  const last = messages[messages.length - 1];
  const headers = last.payload?.headers ?? [];
  const fromRaw = getHeader(headers, "From");
  const toRaw = getHeader(headers, "To");
  const subject = getHeader(headers, "Subject") || "(No subject)";
  const fromEmail = extractEmailAddress(fromRaw);
  const fromName = extractDisplayName(fromRaw);

  const isOutbound = fromEmail === userEmail;
  const counterpartyRaw = isOutbound ? toRaw : fromRaw;
  const counterpartyEmail = extractEmailAddress(counterpartyRaw);
  const counterpartyName = extractDisplayName(counterpartyRaw);

  if (!counterpartyEmail || counterpartyEmail === userEmail) return null;

  const internalDate = last.internalDate
    ? new Date(Number(last.internalDate)).toISOString()
    : new Date().toISOString();

  return {
    gmailThreadId: thread.id,
    subject,
    snippet: last.snippet ?? thread.snippet ?? "",
    fromRaw,
    fromEmail,
    fromName,
    toRaw,
    counterpartyEmail,
    counterpartyName,
    lastMessageAt: internalDate,
    direction: isOutbound ? "outbound" : "inbound",
  };
}
