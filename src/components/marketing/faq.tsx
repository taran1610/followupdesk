"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Who is Follow-Up Desk for?",
    a: "Coaches, consultants, and small agencies who sell through conversations—not high-volume outbound. If you have warm leads and need a calm place to track them, it's for you.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. Create a free account with Google or email. Your leads and follow-ups are saved to your account from day one.",
  },
  {
    q: "Does AI actually send emails?",
    a: "Never. Email Brain reads your recent Gmail threads to categorize leads and draft follow-ups. You review every message and click Send yourself — AI cannot email anyone on its own.",
  },
  {
    q: "Can I import my existing leads?",
    a: "CSV import is on the roadmap. For now you can add leads manually from the Leads page.",
  },
  {
    q: "Is my data secure?",
    a: "Row-level security keeps each user's data isolated in Supabase. We never sell your lead data.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-24 border-t border-[#e8e4dc] px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="marketing-label">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Common questions
          </h2>
          <p className="mt-4 text-[#6b6560]">
            Still curious?{" "}
            <a href="/signup" className="font-medium text-zinc-950 underline-offset-4 hover:underline">
              Start a free account
            </a>{" "}
            and try it on a single lead.
          </p>
        </div>

        <div className="divide-y divide-[#e8e4dc]">
          {FAQS.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 py-5 text-left"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                >
                  <span className="font-medium text-zinc-950">{item.q}</span>
                  <Plus
                    className={cn(
                      "mt-0.5 size-4 shrink-0 text-[#6b6560] transition-transform",
                      open && "rotate-45"
                    )}
                  />
                </button>
                {open && (
                  <p className="pb-5 text-sm leading-relaxed text-[#6b6560]">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
