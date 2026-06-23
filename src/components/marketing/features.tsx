import {
  Clock,
  GitBranch,
  Mail,
  MessageSquare,
  Sparkles,
  Target,
  User,
} from "lucide-react";

const QUEUE_ROWS = [
  { name: "Diego Santos", badge: "Due today", badgeClass: "bg-[#d4a574]/30 text-[#7a5c3a]" },
  { name: "Marcus Rivera", badge: "New inbound", badgeClass: "bg-[#f7f4ef] text-[#6b6560] border border-[#e8e4dc]" },
  { name: "Priya Shah", badge: "Quiet 5d", badgeClass: "bg-[#f7f4ef] text-[#6b6560] border border-[#e8e4dc]" },
];

const PIPELINE_STAGES = ["New", "Contacted", "Proposal", "Won", "Lost"];

function FeatureLabel({ icon: Icon, children }: { icon: typeof Target; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 text-[#6b6560]" />
      <span className="marketing-label">{children}</span>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-4xl">
            Everything you need to stay on top of warm leads
          </h2>
          <p className="text-lg leading-relaxed text-[#6b6560] lg:pt-2">
            Not another enterprise CRM. A focused workspace for the daily habit of
            following up well.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
          {/* The Queue */}
          <article className="marketing-card lg:col-span-7 lg:row-span-2">
            <FeatureLabel icon={Target}>The queue</FeatureLabel>
            <h3 className="mt-4 text-xl font-semibold text-zinc-950">
              A prioritized list of who to message today
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b6560]">
              Overdue proposals, new inbound leads, and quiet conversations bubble up
              automatically.
            </p>
            <ul className="mt-6 space-y-2">
              <li className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e4dc] px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Amara Okafor</p>
                  <p className="text-xs text-[#6b6560]">Proposal sent — 1d overdue</p>
                </div>
                <span className="rounded-full bg-zinc-950 px-2.5 py-0.5 text-[10px] font-medium text-white">
                  1d overdue
                </span>
              </li>
              {QUEUE_ROWS.map((row) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e4dc] px-4 py-3"
                >
                  <p className="text-sm font-medium">{row.name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${row.badgeClass}`}>
                    {row.badge}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          {/* AI Drafts — dark card */}
          <article className="rounded-3xl bg-zinc-950 p-6 text-white md:p-8 lg:col-span-5">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles className="size-3.5" />
              <span className="text-[11px] font-medium tracking-[0.18em] uppercase">AI drafts</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold">
              Email Brain drafts from your real threads
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Syncs Gmail, categorizes leads, and drafts follow-ups. You review and
              send — AI never emails on its own.
            </p>
            <div className="mt-6 rounded-2xl bg-zinc-900 p-4">
              <p className="text-sm leading-relaxed text-zinc-300">
                &ldquo;Hi Amara — circling back on the proposal. Happy to walk through any
                questions on a quick call this week…&rdquo;
              </p>
            </div>
          </article>

          {/* Pipeline */}
          <article className="marketing-card lg:col-span-5">
            <FeatureLabel icon={GitBranch}>Pipeline</FeatureLabel>
            <h3 className="mt-4 text-lg font-semibold text-zinc-950">Simple lead stages</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((stage) => (
                <span
                  key={stage}
                  className="rounded-full border border-[#e8e4dc] bg-[#faf8f5] px-3 py-1 text-xs font-medium text-[#6b6560]"
                >
                  {stage}
                </span>
              ))}
            </div>
          </article>

          {/* Smart reminders */}
          <article className="marketing-card lg:col-span-4">
            <FeatureLabel icon={Clock}>Smart reminders</FeatureLabel>
            <h3 className="mt-4 text-lg font-semibold text-zinc-950">
              Honest last-contact dates
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b6560]">
              Schedule the next touch so nothing slips through the cracks.
            </p>
          </article>

          {/* Email Brain */}
          <article className="marketing-card lg:col-span-4">
            <FeatureLabel icon={Mail}>Email Brain</FeatureLabel>
            <h3 className="mt-4 text-lg font-semibold text-zinc-950">
              Read, categorize, send — you stay in control
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b6560]">
              Syncs recent Gmail threads, flags who needs a reply, and sends from your
              address when you click Send.
            </p>
          </article>

          {/* Solo sellers */}
          <article className="marketing-card lg:col-span-6">
            <FeatureLabel icon={User}>Built for solo sellers</FeatureLabel>
            <h3 className="mt-4 text-lg font-semibold text-zinc-950">
              One workspace. Every warm conversation in one calm view.
            </h3>
          </article>

          {/* Notes */}
          <article className="marketing-card lg:col-span-6">
            <FeatureLabel icon={MessageSquare}>Notes & context</FeatureLabel>
            <h3 className="mt-4 text-lg font-semibold text-zinc-950">
              Deal value, next step, and the small things you&apos;d forget
            </h3>
          </article>
        </div>
      </div>
    </section>
  );
}
