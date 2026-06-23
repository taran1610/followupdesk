/** Common automated / marketing senders — not real leads. */
const AUTOMATED_LOCAL_PARTS = [
  "noreply",
  "no-reply",
  "newsletter",
  "newsletters",
  "notifications",
  "notification",
  "donotreply",
  "do-not-reply",
  "mailer-daemon",
  "postmaster",
  "support",
  "hello",
  "team",
  "info",
  "billing",
  "updates",
  "marketing",
  "promo",
];

const AUTOMATED_DOMAINS = [
  "substack.com",
  "mail.bubble.io",
  "insideapple.apple.com",
  "vercel.com",
  "github.com",
  "linkedin.com",
  "facebookmail.com",
  "google.com",
  "accounts.google.com",
  "raiseyouredge.com",
];

export function isAutomatedSender(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return true;

  if (AUTOMATED_LOCAL_PARTS.some((p) => local === p || local.startsWith(`${p}+`))) {
    return true;
  }
  if (AUTOMATED_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) {
    return true;
  }
  return false;
}

export function looksLikePersonEmail(email: string): boolean {
  return !isAutomatedSender(email);
}
