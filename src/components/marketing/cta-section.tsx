import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-zinc-950 px-6 py-14 text-center text-white md:px-16 md:py-16">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Ready to stop losing warm leads?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Create a free account, connect Gmail, and start following up from one calm
            workspace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="marketing-pill-btn inline-flex h-11 items-center gap-2 bg-white px-6 text-zinc-950 hover:bg-zinc-100"
            >
              Create free account
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="marketing-pill-btn inline-flex h-11 items-center border border-white/25 bg-transparent px-6 text-white hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
