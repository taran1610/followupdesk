import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { APP_TAGLINE } from "@/lib/config";

const FOOTER_LINKS = {
  Product: [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
  ],
  Company: [
    { href: "/login", label: "Sign in" },
    { href: "/signup", label: "Create account" },
    { href: "/login", label: "Try demo" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-border/60 bg-muted/30 border-t">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-3">
            <Logo />
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              {APP_TAGLINE} Built for coaches, consultants, and small agencies who
              sell through relationships—not cold spam.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="mb-3 text-sm font-semibold">{title}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground mt-12 flex flex-col gap-2 border-t pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Follow-Up Desk. All rights reserved.</p>
          <p>Supabase, email, and calendar integrations coming soon.</p>
        </div>
      </div>
    </footer>
  );
}
