import Link from "next/link";
import { Mail } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  inverted = false,
}: {
  className?: string;
  showText?: boolean;
  inverted?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 transition-opacity hover:opacity-80", className)}
    >
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          inverted ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"
        )}
      >
        <Mail className="size-4" />
      </div>
      {showText && (
        <span className={cn("text-base font-semibold tracking-tight", inverted && "text-white")}>
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
