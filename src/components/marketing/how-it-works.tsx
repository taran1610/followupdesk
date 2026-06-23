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
    <section id="how-it-works" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="marketing-label">How it works</p>
        <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Three steps to clearer follow-ups
        </h2>

        <ol className="mt-12 grid overflow-hidden rounded-3xl border border-[#e8e4dc] bg-white md:grid-cols-3">
          {STEPS.map((item, index) => (
            <li
              key={item.step}
              className={`p-8 md:p-10 ${index < STEPS.length - 1 ? "md:border-r md:border-[#e8e4dc]" : ""}`}
            >
              <span className="text-5xl font-semibold tabular-nums text-[#e8e4dc]">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6b6560]">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
