import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AuthUser } from "@/lib/types";

function initials(user: AuthUser): string {
  const base = user.fullName || user.email;
  return base
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function SidebarFooter({ user }: { user: AuthUser }) {
  return (
    <div className="space-y-3 border-t px-3 py-4">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-xs font-semibold">Upgrade to Pro</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
          Unlimited AI drafts & advanced Email Brain.
        </p>
        <Button
          size="sm"
          className="mt-2 h-7 w-full text-xs"
          nativeButton={false}
          render={<Link href="/pricing" />}
        >
          <Sparkles className="size-3.5" />
          Upgrade
        </Button>
      </div>
      <div className="flex items-center gap-2.5 px-1">
        <Avatar className="size-8">
          <AvatarFallback className="bg-zinc-100 text-xs text-zinc-800">
            {initials(user)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.fullName ?? "Account"}</p>
          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
