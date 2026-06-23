const FAQS = [
  {
    q: "Who is Follow-Up Desk for?",
    a: "Coaches, consultants, and small agencies who sell through conversations—not high-volume outbound. If you have warm leads and need a calm place to track them, it's for you.",
  },
  {
    q: "Do I need Supabase to use it today?",
    a: "No. The app runs in demo mode with seeded data so you can explore immediately. When you're ready, connect Supabase for real accounts and persistent storage.",
  },
  {
    q: "Does AI actually send emails?",
    a: "AI drafts the message—you review and edit it. Connect Gmail in Settings to send follow-ups from your own address with one click. Replies go to your normal inbox.",
  },
  {
    q: "Can I import my existing leads?",
    a: "CSV import is on the roadmap. For now you can add leads manually or use the demo dataset to see how the workflow feels.",
  },
  {
    q: "Is my data secure?",
    a: "When Supabase is connected, row-level security keeps each user's data isolated. We never sell your lead data.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-muted/40 scroll-mt-20 border-t py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <div className="text-center">
          <p className="text-brand text-sm font-medium">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Common questions</h2>
        </div>
        <dl className="mt-12 space-y-8">
          {FAQS.map((item) => (
            <div key={item.q}>
              <dt className="text-base font-semibold">{item.q}</dt>
              <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
