import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { appOrigin } from "@/lib/config";
import { getPaidPlan } from "@/lib/billing/plans";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to subscribe." }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 }
    );
  }

  let planId: string;
  try {
    const body = (await request.json()) as { plan?: string };
    planId = body.plan ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const plan = getPaidPlan(planId);
  if (!plan?.stripePriceId) {
    return NextResponse.json({ error: "Unknown or unpaid plan." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id as string | null | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    const admin = createSupabaseAdminClient();
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin = appOrigin();
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    metadata: {
      supabase_user_id: user.id,
      plan_id: plan.id,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan_id: plan.id,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
