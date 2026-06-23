import {
  AlarmClock,
  Bot,
  Kanban,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Follow up now queue",
    description:
      "A prioritized list of who needs a touch today—overdue proposals, new inbound leads, and quiet conversations bubble up automatically.",
  },
  {
    icon: Kanban,
    title: "Simple lead pipeline",
    description:
      "Track status from first contact to won or lost. Search, filter, and sort without wrestling a bloated CRM.",
  },
  {
    icon: Bot,
    title: "AI draft messages",
    description:
      "Generate email and SMS follow-ups tuned to tone and goal. Connect Gmail and send from your own address.",
  },
  {
    icon: AlarmClock,
    title: "Smart reminders",
    description:
      "Schedule the next touch and keep last-contact dates honest so nothing slips through the cracks.",
  },
  {
    icon: Users,
    title: "Built for solo sellers",
    description:
      "Coaches, consultants, and small agencies—one workspace, one view of every warm conversation.",
  },
  {
    icon: Sparkles,
    title: "Ready to grow",
    description:
      "Connect Gmail to send follow-ups as you. Calendar sync is on the roadmap.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="max-w-2xl">
          <p className="text-brand text-sm font-medium">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Everything you need to stay on top of warm leads
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Not another enterprise CRM. A focused workspace for the daily habit
            of following up well.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="border-border/80 bg-card rounded-xl border p-6 shadow-sm"
            >
              <div className="bg-brand/10 text-brand mb-4 flex size-10 items-center justify-center rounded-lg">
                <feature.icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
