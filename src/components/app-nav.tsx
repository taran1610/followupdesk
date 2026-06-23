"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Kanban,
  LayoutDashboard,
  Mail,
  Plug,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/dashboard#inbox", label: "Inbox", icon: Mail, badgeKey: "inbox" as const },
  { href: "/dashboard#pipeline", label: "Pipeline", icon: Kanban },
  { href: "/leads", label: "Templates", icon: FileText },
  { href: "/dashboard", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings", label: "Integrations", icon: Plug },
] as const;

export function AppNav({
  onNavigate,
  badges,
}: {
  onNavigate?: () => void;
  badges?: { inbox?: number };
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/dashboard#inbox" || item.href === "/dashboard#pipeline"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const badge =
          "badgeKey" in item && item.badgeKey === "inbox" ? badges?.inbox : undefined;

        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {badge != null && badge > 0 && (
              <Badge className="h-5 min-w-5 justify-center rounded-full bg-orange-600 px-1.5 text-[10px] text-white">
                {badge > 99 ? "99+" : badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
