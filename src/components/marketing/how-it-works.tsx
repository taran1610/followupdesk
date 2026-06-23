const STEPS = [
  {
    step: "01",
    title: "Add your leads",
    description:
      "Drop in prospects from referrals, your website, or events. Notes, deal value, and next follow-up date in one place.",
  },
  {
    step: "02",
    title: "Open your dashboard",
    description:
      "See who is hot, who is stale, and who needs a follow-up today. Your daily queue is sorted by urgency.",
  },
  {
    step: "03",
    title: "Draft and send",
    description:
      "Use AI to draft a check-in, proposal follow-up, or revive message. Log the touch and schedule the next one.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/40 scroll-mt-20 border-t py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="max-w-2xl">
          <p className="text-brand text-sm font-medium">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps to clearer follow-ups
          </h2>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((item) => (
            <li key={item.step} className="relative">
              <span className="text-brand/30 text-5xl font-semibold tabular-nums">
                {item.step}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
