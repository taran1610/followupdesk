import { Sparkles } from "lucide-react";

const QUEUE_LEADS = [
  { name: "Amara Okafor", note: "Proposal sent — 1d overdue", badge: "Hot", badgeClass: "bg-zinc-950 text-white" },
  { name: "Diego Santos", note: "Follow-up due today", badge: "Warm", badgeClass: "bg-[#e8e4dc] text-zinc-800" },
  { name: "Marcus Rivera", note: "New inbound — reach out fast", badge: "New", badgeClass: "bg-[#f7f4ef] text-zinc-700 border border-[#e8e4dc]" },
];

/** Compact app mock for the hero — mirrors the real dashboard UI. */
export function HeroProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="overflow-hidden rounded-3xl border border-[#e8e4dc] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-2 border-b border-[#e8e4dc] bg-[#faf8f5] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-[#e8e4dc]" />
            <span className="size-2 rounded-full bg-[#e8e4dc]" />
            <span className="size-2 rounded-full bg-[#e8e4dc]" />
          </div>
          <span className="ml-1 text-xs text-[#6b6560]">app.followupdesk.com</span>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="marketing-label">Today</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">Follow up now</p>
            </div>
            <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
              3 due
            </span>
          </div>

          <ul className="mt-5 space-y-2">
            {QUEUE_LEADS.map((lead) => (
              <li
                key={lead.name}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e4dc] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-950">{lead.name}</p>
                  <p className="truncate text-xs text-[#6b6560]">{lead.note}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${lead.badgeClass}`}>
                  {lead.badge}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-2xl border border-[#e8e4dc] bg-[#faf8f5] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#6b6560]">
              <Sparkles className="size-3.5" />
              AI draft
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-800">
              Hi Amara — circling back on the proposal. Happy to walk through any
              questions on a quick call this week…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Legacy export kept for any imports — hero uses HeroProductPreview directly. */
export function ProductPreview() {
  return null;
}
