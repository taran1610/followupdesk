import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { APP_TAGLINE } from "@/lib/config";

const FOOTER_LINKS = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
  ],
  Company: [
    { href: "/login", label: "Sign in" },
    { href: "/signup", label: "Create account" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e8e4dc] px-4 py-14 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-[#6b6560]">
              {APP_TAGLINE} Built for coaches, consultants, and small agencies who sell
              through relationships — not cold spam.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="marketing-label mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6b6560] transition-colors hover:text-zinc-950"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-[#e8e4dc] pt-8 text-xs text-[#6b6560] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Follow-Up Desk. All rights reserved.</p>
          <p>Gmail send-as-you is live. Calendar sync coming soon.</p>
        </div>
      </div>
    </footer>
  );
}
