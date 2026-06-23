import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl px-6 py-14 text-center md:px-12">
          <div className="bg-brand/20 pointer-events-none absolute -top-24 -right-24 size-64 rounded-full blur-3xl" />
          <h2 className="relative text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Ready to stop losing warm leads?
          </h2>
          <p className="text-primary-foreground/80 relative mx-auto mt-4 max-w-xl text-lg">
            Start free in demo mode. Connect your account and integrations when
            you&apos;re ready to go live.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="h-11"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Create free account
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 h-11"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Try demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
