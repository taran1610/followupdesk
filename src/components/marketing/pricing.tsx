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
      "AI draft messages (mock or OpenAI)",
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
      "Send follow-ups from your Gmail",
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
    <section id="pricing" className={cn("scroll-mt-20 py-20 md:py-28", className)}>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {showHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-brand text-sm font-medium">Pricing</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple plans that grow with you
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Start free, then upgrade to Pro or Agency when you&apos;re ready.
            </p>
          </div>
        )}

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 shadow-sm",
                plan.highlighted
                  ? "border-brand/40 bg-brand/[0.03] ring-brand/20 ring-1"
                  : "border-border/80 bg-card"
              )}
            >
              {plan.highlighted && (
                <span className="bg-brand text-brand-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-medium">
                  Most popular
                </span>
              )}
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </p>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm">
                    <Check className="text-brand mt-0.5 size-4 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <PricingPlanButton
                  planId={plan.id}
                  label={plan.cta}
                  variant={plan.highlighted ? "default" : "outline"}
                  stripeEnabled={stripeEnabled}
                />
              </div>
            </article>
          ))}
        </div>

        {!stripeEnabled && (
          <p className="text-muted-foreground mt-8 text-center text-sm">
            Paid plans use Stripe. Add your Stripe keys to enable checkout, or{" "}
            <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
              start free
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
