export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_GMAIL_CLIENT_ID && process.env.GOOGLE_GMAIL_CLIENT_SECRET
  );
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const APP_NAME = "Follow-Up Desk";
export const APP_TAGLINE = "Turn warm leads into next conversations.";
export const APP_DESCRIPTION =
  "A calm CRM for coaches, consultants, and small agencies. Track warm leads, know who needs a follow-up today, and draft messages that reopen conversations.";

export const MARKETING_NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
] as const;

// Fixed identity used in local/demo mode (no Supabase configured).
export const DEMO_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "demo@followupdesk.app",
  fullName: "Demo Coach",
};

export const DEMO_SESSION_COOKIE = "fud_demo_session";
