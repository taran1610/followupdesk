import crypto from "crypto";
import {
  GMAIL_SEND_SCOPE,
  gmailOAuthStateSecret,
  gmailRedirectUri,
} from "./config";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export function buildGmailAuthUrl(userId: string): string {
  const state = signOAuthState(userId);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_GMAIL_CLIENT_ID!,
    redirect_uri: gmailRedirectUri(),
    response_type: "code",
    scope: GMAIL_SEND_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function signOAuthState(userId: string): string {
  const issuedAt = Date.now();
  const payload = `${userId}:${issuedAt}`;
  const signature = crypto
    .createHmac("sha256", gmailOAuthStateSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyOAuthState(state: string): string | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon <= 0) return null;

    const payload = decoded.slice(0, lastColon);
    const signature = decoded.slice(lastColon + 1);
    const expected = crypto
      .createHmac("sha256", gmailOAuthStateSecret())
      .update(payload)
      .digest("hex");

    if (signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    const [userId, issuedAtRaw] = payload.split(":");
    const issuedAt = Number(issuedAtRaw);
    if (!userId || !Number.isFinite(issuedAt)) return null;

    // Reject states older than 15 minutes.
    if (Date.now() - issuedAt > 15 * 60 * 1000) return null;

    return userId;
  } catch {
    return null;
  }
}

export async function exchangeCodeForTokens(
  code: string
): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_GMAIL_CLIENT_ID!,
    client_secret: process.env.GOOGLE_GMAIL_CLIENT_SECRET!,
    redirect_uri: gmailRedirectUri(),
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as GoogleTokenResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to connect Gmail.");
  }
  if (!data.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Revoke app access in your Google account and try again."
    );
  }
  return data;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_GMAIL_CLIENT_ID!,
    client_secret: process.env.GOOGLE_GMAIL_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as GoogleTokenResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Gmail session expired. Reconnect in Settings.");
  }
  return data;
}
