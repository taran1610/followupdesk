import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Follow-Up Desk handles your data and Gmail access.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#6b6560]">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
      <p className="marketing-label">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-[#6b6560]">Last updated: June 23, 2026</p>

      <div className="mt-10 space-y-10">
        <Section title="Overview">
          <p>
            {APP_NAME} (&quot;we&quot;, &quot;us&quot;) helps coaches, consultants, and small
            agencies track warm leads and draft follow-up emails. This policy explains what
            data we collect, how we use it, and your choices.
          </p>
        </Section>

        <Section title="Information we collect">
          <p>
            <strong className="text-zinc-950">Account data:</strong> email address, name,
            and authentication details when you sign up with Google or email/password.
          </p>
          <p>
            <strong className="text-zinc-950">CRM data:</strong> leads, notes, follow-ups,
            and AI-generated drafts you create in the app.
          </p>
          <p>
            <strong className="text-zinc-950">Gmail data (optional):</strong> if you connect
            Gmail, we access recent email threads (subject, sender, snippet, and date) to
            match conversations to leads, categorize follow-ups, and draft replies. We use
            the Gmail send scope only when you explicitly click Send — we never send email
            automatically.
          </p>
        </Section>

        <Section title="How we use Gmail data">
          <ul className="list-disc space-y-2 pl-5">
            <li>Sync recent threads to your dashboard (Email Brain)</li>
            <li>Match senders to existing leads by email address</li>
            <li>Categorize threads (e.g. needs reply, new inquiry, gone quiet)</li>
            <li>Generate draft follow-ups you can review and edit</li>
            <li>Send email from your Gmail address only when you click Send</li>
          </ul>
          <p>
            We do not sell your email content. We do not use your inbox for advertising. We
            do not grant AI the ability to send messages without your action.
          </p>
        </Section>

        <Section title="Data storage and security">
          <p>
            Data is stored in Supabase (PostgreSQL) with row-level security so each user
            only accesses their own leads and synced threads. Gmail OAuth tokens are stored
            server-side and are never exposed to the browser.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>We use trusted providers to operate the service:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Supabase — authentication and database</li>
            <li>Google — Gmail OAuth (read and send, with your consent)</li>
            <li>OpenAI — optional AI draft generation (lead notes and email snippets you provide)</li>
            <li>Vercel — application hosting</li>
          </ul>
        </Section>

        <Section title="Data retention and deletion">
          <p>
            Your leads and synced email metadata remain until you delete them or close your
            account. You can disconnect Gmail at any time in Settings, which stops future
            syncs. To request full account deletion, contact us at the email below.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can access, export, correct, or delete your data by using the app or
            contacting us. You can revoke Gmail access in Settings or in your Google Account
            security settings.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy:{" "}
            <a
              href="mailto:taranpreets2004@gmail.com"
              className="font-medium text-zinc-950 underline-offset-4 hover:underline"
            >
              taranpreets2004@gmail.com
            </a>
          </p>
        </Section>
      </div>
    </article>
  );
}
