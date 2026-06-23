import type { NextRequest } from "next/server";
import { appOrigin } from "@/lib/config";

/** Public site origin from the incoming request (works on Vercel + localhost). */
export function requestOrigin(request: Request | NextRequest): string {
  const headers = "headers" in request ? request.headers : null;
  if (headers) {
    const forwardedHost = headers.get("x-forwarded-host");
    const forwardedProto = headers.get("x-forwarded-proto") ?? "https";
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost.split(",")[0].trim()}`;
    }
  }
  return new URL(request.url).origin;
}

export function gmailRedirectUri(origin?: string): string {
  const base = (origin ?? appOrigin()).replace(/\/$/, "");
  return `${base}/api/gmail/callback`;
}

export function validateGmailOAuthConfig(): string | null {
  const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return "Gmail OAuth credentials are not configured on this server.";
  }

  if (!clientId.endsWith(".apps.googleusercontent.com")) {
    return "GOOGLE_GMAIL_CLIENT_ID looks invalid. Use a Web application OAuth client ID from Google Cloud.";
  }

  return null;
}
