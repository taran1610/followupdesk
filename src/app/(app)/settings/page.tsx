import { getGmailStatusAction } from "@/app/actions/gmail";
import { GmailConnectCard } from "@/components/gmail-connect-card";

const BANNERS: Record<string, string> = {
  connected: "Gmail connected — you can send follow-ups from lead pages.",
  denied: "Google sign-in was cancelled. Try again when you're ready.",
  expired: "The connection link expired. Please try connecting again.",
  invalid: "Something went wrong starting Gmail connect. Please try again.",
  supabase_required: "Create a real account with Supabase before connecting Gmail.",
  not_configured: "Gmail OAuth is not configured on this server yet.",
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
