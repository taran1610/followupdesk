import { getGmailStatusAction } from "@/app/actions/gmail";
import { getGmailSyncStatus } from "@/lib/inbox/store";
import { GmailConnectCard } from "@/components/gmail-connect-card";
import { SyncInboxButton } from "@/components/sync-inbox-button";

const BANNERS: Record<string, string> = {
  connected:
    "Gmail connected — syncing your inbox on the Dashboard.",
  denied: "Gmail connection was cancelled. You can try again anytime.",
  expired: "That link expired. Click Connect Gmail to try again.",
  invalid: "Something went wrong. Click Connect Gmail to try again.",
  unavailable: "Gmail connect requires a signed-in account.",
};

function bannerFromSearchParams(
  gmail?: string,
  reason?: string
): string | null {
  if (reason) {
    try {
      return decodeURIComponent(reason);
    } catch {
      return reason;
    }
  }
  if (!gmail) return null;
  if (gmail === "error") return "Could not connect Gmail. Please try again.";
  return BANNERS[gmail] ?? null;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ gmail?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const status = await getGmailStatusAction();
  const syncStatus = status.connected
    ? await getGmailSyncStatus().catch(() => ({
        lastSyncedAt: null,
        lastSyncError: null,
        threadsSynced: 0,
      }))
    : { lastSyncedAt: null, lastSyncError: null, threadsSynced: 0 };
  const banner = bannerFromSearchParams(params.gmail, params.reason);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect integrations and manage how you send follow-ups.
        </p>
      </div>

      <GmailConnectCard status={status} banner={banner} />

      {status.connected && (
        <SyncInboxButton syncStatus={syncStatus} gmailConnected={status.connected} />
      )}
    </div>
  );
}
