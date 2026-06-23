"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { MARKETING_NAV } from "@/lib/config";
import type { AuthUser } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SiteHeader({ user }: { user?: AuthUser | null }) {
  const [open, setOpen] = useState(false);
  const signedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e4dc]/80 bg-[#f7f4ef]/90 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#6b6560] transition-colors hover:text-zinc-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-3 md:flex">
          {signedIn ? (
            <Link href="/dashboard" className="marketing-pill-btn marketing-pill-btn-primary">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-950 transition-opacity hover:opacity-70"
              >
                Sign in
              </Link>
              <Link href="/signup" className="marketing-pill-btn marketing-pill-btn-primary">
                Start free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="col-start-3 inline-flex size-9 items-center justify-center rounded-md text-[#6b6560] hover:text-zinc-950 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-[#e8e4dc] bg-[#f7f4ef] md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-[#e8e4dc] pt-4">
            {signedIn ? (
              <Link href="/dashboard" className="marketing-pill-btn marketing-pill-btn-primary text-center">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="marketing-pill-btn marketing-pill-btn-outline text-center">
                  Sign in
                </Link>
                <Link href="/signup" className="marketing-pill-btn marketing-pill-btn-primary text-center">
                  Start free
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
