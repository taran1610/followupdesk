import { appOrigin } from "@/lib/config";
import { gmailRedirectUri as buildRedirectUri } from "./request-origin";

export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_GMAIL_CLIENT_ID?.trim() &&
      process.env.GOOGLE_GMAIL_CLIENT_SECRET?.trim()
  );
}

/** @deprecated Prefer gmailRedirectUri(origin) with the request origin. */
export function gmailRedirectUri(): string {
  return buildRedirectUri();
}

export function gmailOAuthStateSecret(): string {
  return (
    process.env.GMAIL_OAUTH_STATE_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "dev-gmail-oauth-state-secret"
  );
}
