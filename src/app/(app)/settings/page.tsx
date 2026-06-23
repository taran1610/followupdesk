import { getGmailStatusAction } from "@/app/actions/gmail";
import { GmailConnectCard } from "@/components/gmail-connect-card";

const BANNERS: Record<string, string> = {
  connected: "Gmail connected — you can send follow-ups from any lead page.",
  denied: "Gmail connection was cancelled. You can try again anytime.",
  expired: "That link expired. Click Connect Gmail to try again.",
  invalid: "Something went wrong. Click Connect Gmail to try again.",
  unavailable: "Gmail connect requires a signed-in account.",
};

function bannerFromSearchParams(
  gmail?: string,
  reason?: string
): string | null {
  if (reason) return decodeURIComponent(reason);
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
    </div>
  );
}
