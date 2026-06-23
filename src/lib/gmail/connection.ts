import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { isGmailConfigured } from "@/lib/gmail/config";
import { refreshAccessToken } from "./oauth";

export interface GmailConnectionStatus {
  email: string;
  connectedAt: string;
}

export interface StoredGmailConnection extends GmailConnectionStatus {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export async function getGmailConnectionStatus(
  userId: string
): Promise<GmailConnectionStatus | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_gmail_connection_status");
  if (error) throw error;

  const rows = data as { email: string; connected_at: string }[] | null;
  const row = rows?.[0];
  if (!row) return null;

  return {
    email: row.email,
    connectedAt: row.connected_at,
  };
}

async function getStoredConnection(userId: string): Promise<StoredGmailConnection | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("gmail_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    userId: data.user_id,
    email: data.email,
    connectedAt: data.created_at,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  };
}

export async function saveGmailConnection(args: {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  const expiresAt = new Date(Date.now() + args.expiresInSeconds * 1000).toISOString();

  const { error } = await admin.from("gmail_connections").upsert(
    {
      user_id: args.userId,
      email: args.email,
      access_token: args.accessToken,
      refresh_token: args.refreshToken,
      expires_at: expiresAt,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

export async function deleteGmailConnection(userId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("gmail_connections").delete().eq("user_id", userId);
  if (error) throw error;
}

async function refreshViaSupabaseSession(userId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.provider_token) return null;
  if (data.session.user.id !== userId) return null;
  return data.session.provider_token;
}

export async function getValidGmailAccessToken(userId: string): Promise<{
  accessToken: string;
  email: string;
}> {
  const connection = await getStoredConnection(userId);
  if (!connection) {
    throw new Error("Connect Gmail in Settings before sending.");
  }

  const expiresAt = new Date(connection.expiresAt).getTime();
  const stillValid =
    expiresAt - Date.now() > 60_000 && Boolean(connection.accessToken);

  if (stillValid) {
    return { accessToken: connection.accessToken, email: connection.email };
  }

  if (isGmailConfigured()) {
    const refreshed = await refreshAccessToken(connection.refreshToken);
    const admin = createSupabaseAdminClient();
    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

    const { error } = await admin
      .from("gmail_connections")
      .update({
        access_token: refreshed.access_token,
        expires_at: newExpiresAt,
      })
      .eq("user_id", userId);
    if (error) throw error;

    return { accessToken: refreshed.access_token, email: connection.email };
  }

  const sessionToken = await refreshViaSupabaseSession(userId);
  if (sessionToken) {
    const admin = createSupabaseAdminClient();
    await admin
      .from("gmail_connections")
      .update({
        access_token: sessionToken,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      })
      .eq("user_id", userId);
    return { accessToken: sessionToken, email: connection.email };
  }

  throw new Error("Gmail session expired. Open Settings and connect Gmail again.");
}
