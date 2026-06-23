import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroProductPreview } from "@/components/marketing/product-preview";

export function Hero() {
  return (
    <section className="overflow-hidden px-4 pt-12 pb-8 md:px-8 md:pt-16 md:pb-12">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e4dc] bg-white px-4 py-1.5 text-xs font-medium text-[#6b6560]">
            <span className="size-1.5 rounded-full bg-zinc-950" />
            The calm CRM for relationship-led businesses
          </div>

          <h1 className="mt-8 text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-zinc-950 sm:text-5xl lg:text-[3.25rem]">
            Never lose a warm lead to a <em className="italic">forgotten</em> follow-up
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#6b6560]">
            Follow-Up Desk shows you who needs attention today, keeps your pipeline
            organized, and drafts the next message — so warm leads become real
            conversations.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="marketing-pill-btn marketing-pill-btn-primary h-11 px-6">
              Start free
              <ArrowRight className="size-4" />
            </Link>
            <Link href="#how-it-works" className="marketing-pill-btn marketing-pill-btn-outline h-11 px-6">
              See how it works
            </Link>
          </div>

          <p className="mt-5 text-sm text-[#6b6560]">
            No credit card · Sign up with Google or email
          </p>
        </div>

        <HeroProductPreview />
      </div>
    </section>
  );
}
