import { PricingSection } from "@/components/marketing/pricing";
import { CtaSection } from "@/components/marketing/cta-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for coaches, consultants, and small agencies.",
};

export default function PricingPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-4 text-center md:px-8 md:pt-20">
        <p className="marketing-label">Pricing</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
          Simple plans that grow with you
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[#6b6560]">
          Start free, then upgrade when you need Gmail sending and unlimited leads.
        </p>
      </div>
      <PricingSection showHeader={false} />
      <CtaSection />
    </>
  );
}
