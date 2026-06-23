"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaidPlanId } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

export function PricingPlanButton({
  planId,
  label,
  variant = "default",
  stripeEnabled,
  highlighted = false,
}: {
  planId: "solo" | PaidPlanId;
  label: string;
  variant?: "default" | "outline";
  stripeEnabled: boolean;
  highlighted?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pillClass = cn(
    "marketing-pill-btn w-full",
    highlighted
      ? "bg-white text-zinc-950 hover:bg-zinc-100"
      : variant === "default"
        ? "marketing-pill-btn-primary"
        : "marketing-pill-btn-outline border-[#e8e4dc] bg-[#faf8f5] hover:bg-[#f7f4ef]"
  );

  if (planId === "solo" || !stripeEnabled) {
    return (
      <Link href="/signup" className={pillClass}>
        {label}
      </Link>
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
        className={cn("h-10 w-full rounded-full", highlighted && "bg-white text-zinc-950 hover:bg-zinc-100")}
        variant={highlighted ? "secondary" : variant}
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
