import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using Follow-Up Desk.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#6b6560]">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
      <p className="marketing-label">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm text-[#6b6560]">Last updated: June 23, 2026</p>

      <div className="mt-10 space-y-10">
        <Section title="Agreement">
          <p>
            By using {APP_NAME}, you agree to these terms. If you do not agree, do not use
            the service.
          </p>
        </Section>

        <Section title="The service">
          <p>
            {APP_NAME} is a lead-tracking and follow-up tool. Email Brain can read recent
            Gmail threads and draft messages; you are always responsible for reviewing and
            sending communications. The service does not send email on your behalf unless
            you explicitly click Send.
          </p>
        </Section>

        <Section title="Your responsibilities">
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide accurate account information</li>
            <li>Comply with applicable laws (including anti-spam and privacy laws)</li>
            <li>Only email people you have a legitimate relationship with</li>
            <li>Keep your login credentials secure</li>
          </ul>
        </Section>

        <Section title="Acceptable use">
          <p>You may not use {APP_NAME} to send unsolicited bulk email, spam, phishing, or
            unlawful content. We may suspend accounts that abuse the service or violate
            Google or third-party policies.</p>
        </Section>

        <Section title="Disclaimer">
          <p>
            The service is provided &quot;as is.&quot; AI-generated drafts may contain errors —
            always review before sending. We are not liable for lost deals, deliverability
            issues, or third-party service outages.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions:{" "}
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
