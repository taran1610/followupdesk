import Link from "next/link";
import { Inbox } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 transition-opacity hover:opacity-80", className)}
    >
      <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg shadow-sm">
        <Inbox className="size-4" />
      </div>
      {showText && (
        <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
      )}
    </Link>
  );
}
