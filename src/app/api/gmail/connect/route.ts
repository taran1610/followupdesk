import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isGmailConfigured, isSupabaseConfigured } from "@/lib/config";
import { buildGmailAuthUrl } from "@/lib/gmail/oauth";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/settings?gmail=supabase_required", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  }

  if (!isGmailConfigured()) {
    return NextResponse.redirect(
      new URL("/settings?gmail=not_configured", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  }

  const user = await requireUser();
  const url = buildGmailAuthUrl(user.id);
  return NextResponse.redirect(url);
}
