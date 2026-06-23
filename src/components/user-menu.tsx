"use client";

import { LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";
import type { AuthUser } from "@/lib/types";
import { AppNav, NAV_ITEMS } from "@/components/app-nav";
import Link from "next/link";

function initials(user: AuthUser): string {
  const base = user.fullName || user.email;
  return base
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ user, demoMode }: { user: AuthUser; demoMode: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-9 gap-2 px-2" />}>
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">{initials(user)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">
          {user.fullName ?? user.email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-medium">{user.fullName ?? "Account"}</span>
            <span className="text-muted-foreground text-xs font-normal">{user.email}</span>
          </DropdownMenuLabel>
          {demoMode && (
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
              Demo mode — data resets on restart
            </DropdownMenuLabel>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={signOut} className="w-full">
          <DropdownMenuItem
            className="w-full cursor-pointer"
            render={<button type="submit" />}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MobileNavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu className="size-5" />
        <span className="sr-only">Open navigation</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {NAV_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.href}
            className="cursor-pointer"
            render={<Link href={item.href} />}
          >
            <item.icon className="size-4" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AppNav };
