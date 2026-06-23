import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { saveGmailConnection } from "@/lib/gmail/connection";
import { fetchGmailProfileEmail } from "@/lib/gmail/send";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const gmailConnect = requestUrl.searchParams.get("gmail") === "connect";
  const next = gmailConnect
    ? "/settings?gmail=connected"
    : safeNextPath(requestUrl.searchParams.get("next"));
  const oauthError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");

  const origin = requestUrl.origin;

  if (oauthError) {
    const target = gmailConnect
      ? `${origin}/settings?gmail=denied&reason=${encodeURIComponent(oauthError)}`
      : `${origin}/login?error=${encodeURIComponent(oauthError)}`;
    return NextResponse.redirect(target);
  }

  if (!code) {
    const target = gmailConnect
      ? `${origin}/settings?gmail=invalid`
      : `${origin}/login?error=missing_auth_code`;
    return NextResponse.redirect(target);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    const target = gmailConnect
      ? `${origin}/settings?gmail=unavailable`
      : `${origin}/login?error=supabase_not_configured`;
    return NextResponse.redirect(target);
  }

  let response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const target = gmailConnect
      ? `${origin}/settings?gmail=error&reason=${encodeURIComponent(error.message)}`
      : `${origin}/login?error=${encodeURIComponent(error.message)}`;
    return NextResponse.redirect(target);
  }

  if (gmailConnect) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("Could not read your session after connecting Gmail.");
      }

      if (!session.provider_refresh_token) {
        throw new Error(
          "Gmail send permission was not granted. Try again and approve email access."
        );
      }

      let email = session.user.email ?? "";
      if (session.provider_token) {
        try {
          email = await fetchGmailProfileEmail(session.provider_token);
        } catch {
          // Fall back to auth email if profile lookup fails.
        }
      }

      if (!email) {
        throw new Error("Could not determine your Gmail address.");
      }

      await saveGmailConnection({
        userId: session.user.id,
        email,
        accessToken: session.provider_token ?? "",
        refreshToken: session.provider_refresh_token,
        expiresInSeconds: 3600,
      });

      response = NextResponse.redirect(new URL("/settings?gmail=connected", origin));
    } catch (err) {
      const message = err instanceof Error ? err.message : "connect_failed";
      return NextResponse.redirect(
        `${origin}/settings?gmail=error&reason=${encodeURIComponent(message)}`
      );
    }
  }

  return response;
}
