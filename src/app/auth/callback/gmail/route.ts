import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { saveGmailConnection } from "@/lib/gmail/connection";
import { fetchGmailProfileEmail } from "@/lib/gmail/send";
import { syncInboxForUser } from "@/lib/inbox/sync";

/** Dedicated Gmail OAuth callback — avoids losing ?gmail=connect query params. */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");
  const origin = requestUrl.origin;

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/settings?gmail=denied&reason=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/settings?gmail=invalid`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.redirect(`${origin}/settings?gmail=unavailable`);
  }

  let response = NextResponse.redirect(new URL("/dashboard?gmail=connected", origin));

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
    return NextResponse.redirect(
      `${origin}/settings?gmail=error&reason=${encodeURIComponent(error.message)}`
    );
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Could not read your session after connecting Gmail.");
    }

    if (!session.provider_refresh_token) {
      throw new Error(
        "Gmail permissions were not granted. Disconnect in Google Account → Security → Third-party access, then try Connect again."
      );
    }

    let email = session.user.email ?? "";
    if (session.provider_token) {
      try {
        email = await fetchGmailProfileEmail(session.provider_token);
      } catch {
        // Fall back to auth email.
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

    // Best-effort first inbox sync after connect.
    try {
      await syncInboxForUser(session.user.id);
      response = NextResponse.redirect(new URL("/dashboard?gmail=connected&sync=done", origin));
    } catch {
      response = NextResponse.redirect(
        new URL("/dashboard?gmail=connected&sync=needed", origin)
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "connect_failed";
    return NextResponse.redirect(
      `${origin}/settings?gmail=error&reason=${encodeURIComponent(message)}`
    );
  }

  return response;
}
