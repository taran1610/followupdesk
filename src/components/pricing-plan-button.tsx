"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaidPlanId } from "@/lib/billing/plans";

export function PricingPlanButton({
  planId,
  label,
  variant = "default",
  stripeEnabled,
}: {
  planId: "solo" | PaidPlanId;
  label: string;
  variant?: "default" | "outline";
  stripeEnabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (planId === "solo" || !stripeEnabled) {
    return (
      <Button
        className="w-full"
        variant={variant}
        nativeButton={false}
        render={<Link href="/signup" />}
      >
        {label}
      </Button>
    );
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      <Button
        className="w-full"
        variant={variant}
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {label}
      </Button>
      {error && <p className="text-destructive text-center text-xs">{error}</p>}
    </div>
  );
}
