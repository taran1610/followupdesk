import Link from "next/link";
import { Mail } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import { AppNav } from "@/components/app-nav";
import { SidebarFooter } from "@/components/sidebar-footer";
import { MobileNavMenu, UserMenu } from "@/components/user-menu";
import { getInboxBrainStatusAction } from "@/app/actions/inbox";

function AppLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-orange-600 text-white">
        <Mail className="size-4" />
      </div>
      <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
    </Link>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const inboxBrain = await getInboxBrainStatusAction().catch(() => null);
  const inboxBadge =
    inboxBrain?.stats.realConversations ??
    inboxBrain?.queue.length ??
    0;

  return (
    <div className="flex min-h-dvh bg-muted/20">
      <aside className="bg-sidebar hidden w-64 shrink-0 flex-col border-r md:flex">
        <div className="flex h-14 items-center gap-2 px-4">
          <AppLogo />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <AppNav badges={{ inbox: inboxBadge }} />
        </div>
        <SidebarFooter user={user} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <MobileNavMenu inboxBadge={inboxBadge} />
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <AppLogo />
            </Link>
          </div>
          <UserMenu user={user} />
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
