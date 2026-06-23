import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens, verifyOAuthState } from "@/lib/gmail/oauth";
import { saveGmailConnection } from "@/lib/gmail/connection";
import { fetchGmailProfileEmail } from "@/lib/gmail/send";
import { requestOrigin } from "@/lib/gmail/request-origin";

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/settings?gmail=denied&reason=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/settings?gmail=invalid`);
  }

  const userId = verifyOAuthState(state);
  if (!userId) {
    return NextResponse.redirect(`${origin}/settings?gmail=expired`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, origin);
    const email = await fetchGmailProfileEmail(tokens.access_token);

    await saveGmailConnection({
      userId,
      email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token!,
      expiresInSeconds: tokens.expires_in,
    });

    return NextResponse.redirect(`${origin}/settings?gmail=connected`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "connect_failed";
    return NextResponse.redirect(
      `${origin}/settings?gmail=error&reason=${encodeURIComponent(message)}`
    );
  }
}
