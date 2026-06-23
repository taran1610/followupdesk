/** Extract a bare email address from a RFC 5322 From/To header value. */
export function extractEmailAddress(raw: string): string {
  const trimmed = raw.trim();
  const bracketed = /<([^>]+)>/.exec(trimmed);
  if (bracketed?.[1]) return bracketed[1].trim().toLowerCase();
  const plain = /[\w.+-]+@[\w.-]+\.\w+/.exec(trimmed);
  return (plain?.[0] ?? trimmed).toLowerCase();
}

/** Extract display name from a From/To header, if present. */
export function extractDisplayName(raw: string): string | null {
  const trimmed = raw.trim();
  const bracketed = /^(.+?)\s*<[^>]+>$/.exec(trimmed);
  if (bracketed?.[1]) {
    const name = bracketed[1].replace(/^["']|["']$/g, "").trim();
    return name || null;
  }
  if (trimmed.includes("@")) return null;
  return trimmed || null;
}

export interface GmailHeader {
  name: string;
  value: string;
}

export function getHeader(headers: GmailHeader[], name: string): string {
  const found = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return found?.value ?? "";
}
