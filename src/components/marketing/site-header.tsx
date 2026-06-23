"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { Button } from "@/components/ui/button";
import { MARKETING_NAV } from "@/lib/config";
import type { AuthUser } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SiteHeader({ user }: { user?: AuthUser | null }) {
  const [open, setOpen] = useState(false);
  const signedIn = Boolean(user);

  return (
    <header className="border-border/60 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <Button size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
              Open dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button size="sm" nativeButton={false} render={<Link href="/signup" />}>
                Start free
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-md md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-border/60 bg-background border-t md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t pt-4">
            {signedIn ? (
              <Button nativeButton={false} render={<Link href="/dashboard" />}>
                Open dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>
                  Sign in
                </Button>
                <Button nativeButton={false} render={<Link href="/signup" />}>
                  Start free
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
