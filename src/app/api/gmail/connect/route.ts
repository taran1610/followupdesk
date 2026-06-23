import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { isGmailConfigured } from "@/lib/gmail/config";
import { buildGmailAuthUrl } from "@/lib/gmail/oauth";
import { requestOrigin, validateGmailOAuthConfig } from "@/lib/gmail/request-origin";

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/settings?gmail=supabase_required", origin));
  }

  if (!isGmailConfigured()) {
    return NextResponse.redirect(new URL("/settings?gmail=not_configured", origin));
  }

  const configError = validateGmailOAuthConfig();
  if (configError) {
    return NextResponse.redirect(
      new URL(
        `/settings?gmail=error&reason=${encodeURIComponent(configError)}`,
        origin
      )
    );
  }

  const user = await requireUser();
  const url = buildGmailAuthUrl(user.id, origin);
  return NextResponse.redirect(url);
}
