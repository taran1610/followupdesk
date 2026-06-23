import Link from "next/link";
import { Inbox } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import { AppNav } from "@/components/app-nav";
import { MobileNavMenu, UserMenu } from "@/components/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh">
      <aside className="bg-sidebar hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
            <Inbox className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        </div>
        <div className="flex-1 px-3 py-2">
          <AppNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <MobileNavMenu />
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <Inbox className="size-3.5" />
              </div>
              <span className="text-sm font-semibold">{APP_NAME}</span>
            </Link>
          </div>
          <UserMenu user={user} />
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
