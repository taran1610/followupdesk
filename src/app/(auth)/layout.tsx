import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-shell flex min-h-dvh flex-col">
      <header className="border-b border-[#e8e4dc] px-4 py-4 md:px-8">
        <Logo />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="border-t border-[#e8e4dc] px-4 py-6 text-center text-xs text-[#6b6560]">
        <Link href="/" className="transition-colors hover:text-zinc-950">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}
