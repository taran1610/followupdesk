import { appOrigin } from "@/lib/config";

export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_GMAIL_CLIENT_ID && process.env.GOOGLE_GMAIL_CLIENT_SECRET
  );
}

export function gmailRedirectUri(): string {
  return `${appOrigin()}/api/gmail/callback`;
}

export function gmailOAuthStateSecret(): string {
  return (
    process.env.GMAIL_OAUTH_STATE_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "dev-gmail-oauth-state-secret"
  );
}
