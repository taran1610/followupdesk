"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Your follow-up command center.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden w-72 md:block">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search leads, emails, notes..."
            className="bg-muted/40 h-9 pl-9"
            readOnly
            onFocus={(e) => {
              e.currentTarget.blur();
              window.location.href = "/leads";
            }}
          />
          <kbd className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium lg:inline">
            ⌘K
          </kbd>
        </div>
        <Button variant="ghost" size="icon" className="size-9 shrink-0">
          <Bell className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </div>
  );
}
