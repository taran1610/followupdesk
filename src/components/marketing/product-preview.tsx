import { AlarmClock, Flame, Inbox, Snowflake, Users } from "lucide-react";

/** Static product mock for the marketing page — mirrors the real dashboard UI. */
export function ProductPreview() {
  return (
    <section className="border-t py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-brand text-sm font-medium">Inside the app</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your morning follow-up ritual, in one screen
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Open the dashboard, work the queue, log touches. No clutter.
          </p>
        </div>

        <div className="border-border/80 bg-card mt-14 overflow-hidden rounded-2xl border shadow-xl">
          <div className="border-border/60 bg-muted/50 flex items-center gap-2 border-b px-4 py-3">
            <div className="flex gap-1.5">
              <span className="bg-border size-2.5 rounded-full" />
              <span className="bg-border size-2.5 rounded-full" />
              <span className="bg-border size-2.5 rounded-full" />
            </div>
            <span className="text-muted-foreground ml-2 text-xs">app.followupdesk.com/dashboard</span>
          </div>

          <div className="flex min-h-[420px]">
            <aside className="bg-sidebar hidden w-44 shrink-0 border-r p-3 md:block">
              <div className="mb-4 flex items-center gap-2 px-1">
                <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                  <Inbox className="size-3" />
                </div>
                <span className="text-xs font-semibold">Follow-Up Desk</span>
              </div>
              <div className="space-y-1">
                <div className="bg-sidebar-accent rounded-md px-2 py-1.5 text-xs font-medium">
                  Dashboard
                </div>
                <div className="text-muted-foreground rounded-md px-2 py-1.5 text-xs">
                  Leads
                </div>
              </div>
            </aside>

            <div className="flex-1 p-4 md:p-6">
              <p className="text-lg font-semibold">Welcome back, Jamie</p>
              <p className="text-muted-foreground text-sm">Turn warm leads into next conversations.</p>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: "Total leads", value: "24", icon: Users },
                  { label: "Hot leads", value: "5", icon: Flame },
                  { label: "Needs follow-up", value: "3", icon: AlarmClock },
                  { label: "Stale", value: "2", icon: Snowflake },
                ].map((m) => (
                  <div key={m.label} className="border-border/80 rounded-lg border p-3">
                    <p className="text-muted-foreground text-[10px]">{m.label}</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold">Follow up now</p>
                <div className="divide-y rounded-lg border">
                  {[
                    { name: "Amara Okafor", note: "Proposal sent — 1d overdue", status: "Proposal sent" },
                    { name: "Diego Santos", note: "Follow-up due today", status: "Contacted" },
                    { name: "Marcus Rivera", note: "New inbound — reach out fast", status: "New" },
                  ].map((lead) => (
                    <div
                      key={lead.name}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                    >
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-muted-foreground text-xs">{lead.note}</p>
                      </div>
                      <span className="bg-muted text-muted-foreground hidden rounded-md px-2 py-0.5 text-[10px] font-medium sm:inline">
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
