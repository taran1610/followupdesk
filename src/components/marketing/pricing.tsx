import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { isStripeConfigured } from "@/lib/config";
import { PricingPlanButton } from "@/components/pricing-plan-button";

export const PRICING_PLANS = [
  {
    id: "solo" as const,
    name: "Solo",
    price: "$0",
    period: "during beta",
    description: "For coaches and consultants getting started.",
    highlighted: false,
    cta: "Start free",
    features: [
      "Up to 50 active leads",
      "Follow-up queue & reminders",
      "AI draft messages",
      "Notes & pipeline statuses",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For busy solo sellers who live in their pipeline.",
    highlighted: true,
    cta: "Subscribe to Pro",
    features: [
      "Unlimited leads",
      "Priority follow-up scoring",
      "Send from your Gmail",
      "Supabase sync & backups",
      "Export & activity history",
    ],
  },
  {
    id: "agency" as const,
    name: "Agency",
    price: "$79",
    period: "per month",
    description: "For small teams managing shared pipelines.",
    highlighted: false,
    cta: "Subscribe to Agency",
    features: [
      "Everything in Pro",
      "Multiple team members (soon)",
      "Calendar integration (soon)",
      "Shared templates & playbooks",
      "Priority support",
    ],
  },
];

export function PricingSection({
  showHeader = true,
  className,
}: {
  showHeader?: boolean;
  className?: string;
}) {
  const stripeEnabled = isStripeConfigured();

  return (
    <section id="pricing" className={cn("scroll-mt-24 px-4 py-16 md:px-8 md:py-24", className)}>
      <div className="mx-auto max-w-6xl">
        {showHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-label">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Simple plans that grow with you
            </h2>
            <p className="mt-4 text-lg text-[#6b6560]">
              Start free, then upgrade to Pro or Agency when you&apos;re ready.
            </p>
          </div>
        )}

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-3xl border p-7 md:p-8",
                plan.highlighted
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-xl"
                  : "border-[#e8e4dc] bg-white"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold tracking-wide text-zinc-950 uppercase">
                  Most popular
                </span>
              )}
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className={cn("mt-1 text-sm", plan.highlighted ? "text-zinc-400" : "text-[#6b6560]")}>
                  {plan.description}
                </p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                  <span className={cn("text-sm", plan.highlighted ? "text-zinc-400" : "text-[#6b6560]")}>
                    {plan.period}
                  </span>
                </p>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        plan.highlighted ? "text-white" : "text-zinc-950"
                      )}
                    />
                    <span className={plan.highlighted ? "text-zinc-200" : undefined}>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <PricingPlanButton
                  planId={plan.id}
                  label={plan.cta}
                  variant={plan.highlighted ? "default" : "outline"}
                  stripeEnabled={stripeEnabled}
                  highlighted={plan.highlighted}
                />
              </div>
            </article>
          ))}
        </div>

        {!stripeEnabled && (
          <p className="mt-8 text-center text-sm text-[#6b6560]">
            Paid plans use Stripe. Add your Stripe keys to enable checkout, or{" "}
            <Link href="/signup" className="font-medium text-zinc-950 underline-offset-4 hover:underline">
              start free
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
