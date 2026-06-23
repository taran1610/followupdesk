export type PaidPlanId = "pro" | "agency";

export interface BillingPlan {
  id: "solo" | PaidPlanId;
  name: string;
  stripePriceId: string | null;
}

export const BILLING_PLANS: Record<"solo" | PaidPlanId, BillingPlan> = {
  solo: {
    id: "solo",
    name: "Solo",
    stripePriceId: null,
  },
  pro: {
    id: "pro",
    name: "Pro",
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? null,
  },
  agency: {
    id: "agency",
    name: "Agency",
    stripePriceId: process.env.STRIPE_PRICE_AGENCY ?? null,
  },
};

export function getPaidPlan(planId: string): BillingPlan | null {
  if (planId === "pro" || planId === "agency") return BILLING_PLANS[planId];
  return null;
}
