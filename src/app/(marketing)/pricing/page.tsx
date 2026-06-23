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
        <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
          Start free during beta. Pay when you need persistence, email, and team
          features.
        </p>
      </div>
      <PricingSection showHeader={false} />
      <CtaSection />
    </>
  );
}
