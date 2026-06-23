import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { APP_TAGLINE } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-brand/5 pointer-events-none absolute inset-x-0 top-0 h-[480px]" />
      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 md:px-8 md:pt-24 md:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="border-brand/20 bg-brand/5 text-brand mb-6">
            CRM for relationship-led businesses
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Never lose a warm lead to a forgotten follow-up
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty">
            {APP_TAGLINE} Follow-Up Desk shows you who needs attention today,
            keeps your pipeline organized, and drafts follow-ups you can send in
            minutes.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11 px-6" nativeButton={false} render={<Link href="/signup" />}>
              Start free
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            No credit card · Sign up with Google or email
          </p>
        </div>
      </div>
    </section>
  );
}
