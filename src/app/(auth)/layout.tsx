import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-border/60 border-b px-4 py-4 md:px-8">
        <Logo />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="text-muted-foreground border-t px-4 py-6 text-center text-xs">
        <Link href="/" className="hover:text-foreground transition-colors">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}
