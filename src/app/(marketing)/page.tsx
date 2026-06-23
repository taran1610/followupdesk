import { Hero } from "@/components/marketing/hero";
import { SocialProof } from "@/components/marketing/social-proof";
import { ProductPreview } from "@/components/marketing/product-preview";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingSection } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { CtaSection } from "@/components/marketing/cta-section";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <ProductPreview />
      <Features />
      <HowItWorks />
      <PricingSection className="border-t" />
      <Faq />
      <CtaSection />
    </>
  );
}
