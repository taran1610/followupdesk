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
      <div className="rounded-lg border border-orange-200/80 bg-orange-50/50 p-3 dark:border-orange-900/50 dark:bg-orange-950/30">
        <p className="text-xs font-semibold">Upgrade to Pro</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
          Unlimited AI drafts & advanced Email Brain.
        </p>
        <Button
          size="sm"
          className="mt-2 h-7 w-full bg-orange-600 text-xs hover:bg-orange-700"
          nativeButton={false}
          render={<Link href="/pricing" />}
        >
          <Sparkles className="size-3.5" />
          Upgrade
        </Button>
      </div>
      <div className="flex items-center gap-2.5 px-1">
        <Avatar className="size-8">
          <AvatarFallback className="bg-orange-100 text-xs text-orange-700">
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
