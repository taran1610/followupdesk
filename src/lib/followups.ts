import type { Lead, LeadStatus } from "./types";
import { daysBetween, parseISODate } from "./date";

const CLOSED_STATUSES: LeadStatus[] = ["Won", "Lost"];

export function isClosed(lead: Pick<Lead, "status">): boolean {
  return CLOSED_STATUSES.includes(lead.status);
}

/** Days since last contact, or null when never contacted. */
export function daysSinceContact(
  lead: Pick<Lead, "lastContactDate">,
  now: Date = new Date()
): number | null {
  const last = parseISODate(lead.lastContactDate);
  if (!last) return null;
  return daysBetween(last, now);
}

/** Days until the next follow-up. Negative means overdue. Null when unscheduled. */
export function daysUntilFollowUp(
  lead: Pick<Lead, "nextFollowUpDate">,
  now: Date = new Date()
): number | null {
  const next = parseISODate(lead.nextFollowUpDate);
  if (!next) return null;
  return daysBetween(now, next);
}

/** next_follow_up_date is today or earlier. */
export function needsFollowUpToday(
  lead: Pick<Lead, "nextFollowUpDate" | "status">,
  now: Date = new Date()
): boolean {
  if (isClosed(lead)) return false;
  const due = daysUntilFollowUp(lead, now);
  return due !== null && due <= 0;
}

/**
 * Stale when last contact is more than 14 days ago (or never) and the lead is
 * still open. Already-marked "Stale" leads count too.
 */
export function isStale(
  lead: Pick<Lead, "lastContactDate" | "status" | "createdAt">,
  now: Date = new Date()
): boolean {
  if (isClosed(lead)) return false;
  if (lead.status === "Stale") return true;
  const last = parseISODate(lead.lastContactDate);
  const reference = last ?? parseISODate(lead.createdAt);
  if (!reference) return false;
  return daysBetween(reference, now) > 14;
}

export interface PriorityResult {
  score: number;
  reason: string;
}

/**
 * Priority scoring for the "Follow up now" queue. Higher is more urgent.
 * Returns a score of 0 for leads that don't need attention.
 */
export function priority(
  lead: Lead,
  now: Date = new Date()
): PriorityResult {
  if (isClosed(lead)) return { score: 0, reason: "Closed" };

  let score = 0;
  const reasons: string[] = [];

  const sinceContact = daysSinceContact(lead, now);
  const untilFollowUp = daysUntilFollowUp(lead, now);

  // Proposal sent + no contact for 3+ days => prioritize highly.
  if (lead.status === "Proposal sent" && (sinceContact === null || sinceContact >= 3)) {
    score += 60;
    reasons.push("Proposal sent, awaiting reply");
  }

  // New + no contact within 1 day => prioritize.
  if (lead.status === "New" && (sinceContact === null || sinceContact >= 1)) {
    score += 45;
    reasons.push("New lead — reach out fast");
  }

  // Overdue / due-today follow-up.
  if (untilFollowUp !== null && untilFollowUp <= 0) {
    const overdue = Math.abs(untilFollowUp);
    score += 40 + Math.min(overdue, 30);
    reasons.push(overdue === 0 ? "Follow-up due today" : `Follow-up ${overdue}d overdue`);
  }

  // Stale leads bubble up.
  if (isStale(lead, now)) {
    score += 25;
    reasons.push("No contact in 14+ days");
  }

  // Discovery booked deserves a nudge if going cold.
  if (lead.status === "Discovery booked" && (sinceContact === null || sinceContact >= 5)) {
    score += 20;
    reasons.push("Keep discovery warm");
  }

  // Slight boost by deal value so revenue-relevant leads rank higher.
  if (lead.dealValue && lead.dealValue > 0) {
    score += Math.min(Math.round(lead.dealValue / 1000), 15);
  }

  return {
    score,
    reason: reasons[0] ?? "Needs attention",
  };
}

export interface QueuedLead {
  lead: Lead;
  score: number;
  reason: string;
}

export interface WhyFollowUp {
  reason: string;
  explanation: string;
  suggestedAction: string;
}

/** Trust-building explanation for why a lead appears in the queue. */
export function explainFollowUp(lead: Lead, now: Date = new Date()): WhyFollowUp {
  const { reason } = priority(lead, now);
  const sinceContact = daysSinceContact(lead, now);

  let explanation = `This lead is in "${lead.status}"`;
  if (lead.dealValue && lead.dealValue > 0) {
    explanation += `, has a deal value of ${formatDealValue(lead.dealValue)}, and`;
  } else {
    explanation += " and";
  }
  if (sinceContact === null) {
    explanation += " has never been contacted.";
  } else if (sinceContact === 0) {
    explanation += " was contacted today.";
  } else {
    explanation += ` has had no contact for ${sinceContact} day${sinceContact === 1 ? "" : "s"}.`;
  }

  return {
    reason,
    explanation,
    suggestedAction: suggestedNextAction(lead, now),
  };
}

function formatDealValue(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export interface RevenueAtRisk {
  total: number;
  breakdown: { label: string; amount: number }[];
}

/** Sum deal value for leads that need attention now. */
export function computeRevenueAtRisk(
  leads: Lead[],
  now: Date = new Date()
): RevenueAtRisk {
  const queue = buildFollowUpQueue(leads, now);
  const breakdownMap = new Map<string, number>();

  for (const { lead, reason } of queue) {
    const value = lead.dealValue ?? 0;
    if (value <= 0) continue;
    const key = reason.includes("Proposal")
      ? "Proposal overdue"
      : reason.includes("14+") || lead.status === "Stale"
        ? "Stale high-value lead"
        : reason.includes("Discovery")
          ? "Discovery follow-up needed"
          : reason.includes("New")
            ? "New lead needs outreach"
            : "Follow-up due";
    breakdownMap.set(key, (breakdownMap.get(key) ?? 0) + value);
  }

  const breakdown = [...breakdownMap.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    total: breakdown.reduce((sum, b) => sum + b.amount, 0),
    breakdown,
  };
}

export interface PipelineStageRow {
  status: LeadStatus;
  count: number;
  value: number;
}

const PIPELINE_ORDER: LeadStatus[] = [
  "New",
  "Contacted",
  "Discovery booked",
  "Proposal sent",
  "Waiting",
  "Stale",
  "Won",
  "Lost",
];

export function computePipeline(leads: Lead[]): PipelineStageRow[] {
  const map = new Map<LeadStatus, { count: number; value: number }>();
  for (const status of PIPELINE_ORDER) {
    map.set(status, { count: 0, value: 0 });
  }
  for (const lead of leads) {
    const row = map.get(lead.status) ?? { count: 0, value: 0 };
    row.count += 1;
    row.value += lead.dealValue ?? 0;
    map.set(lead.status, row);
  }
  return PIPELINE_ORDER.map((status) => ({
    status,
    count: map.get(status)?.count ?? 0,
    value: map.get(status)?.value ?? 0,
  })).filter((r) => r.count > 0);
}

export interface ComingUpRow {
  label: string;
  count: number;
}

/** Follow-ups grouped for the next 7 days. */
export function computeComingUp(leads: Lead[], now: Date = new Date()): ComingUpRow[] {
  const open = leads.filter((l) => !isClosed(l) && l.nextFollowUpDate);
  const buckets: ComingUpRow[] = [
    { label: "Today", count: 0 },
    { label: "Tomorrow", count: 0 },
    { label: "This week", count: 0 },
    { label: "Next week", count: 0 },
  ];

  for (const lead of open) {
    const due = daysUntilFollowUp(lead, now);
    if (due === null) continue;
    if (due <= 0) buckets[0].count += 1;
    else if (due === 1) buckets[1].count += 1;
    else if (due <= 6) buckets[2].count += 1;
    else if (due <= 13) buckets[3].count += 1;
  }

  return buckets.filter((b) => b.count > 0);
}

export interface TodayFocus {
  totalToday: number;
  proposalCount: number;
  staleCount: number;
  newCount: number;
  topLead: QueuedLead | null;
}

export function computeTodayFocus(leads: Lead[], now: Date = new Date()): TodayFocus {
  const queue = buildFollowUpQueue(leads, now);
  const todayItems = queue.filter(
    ({ lead }) => needsFollowUpToday(lead, now) || priority(lead, now).score > 0
  );

  return {
    totalToday: todayItems.length,
    proposalCount: todayItems.filter(({ lead }) => lead.status === "Proposal sent").length,
    staleCount: todayItems.filter(({ lead }) => isStale(lead, now)).length,
    newCount: todayItems.filter(({ lead }) => lead.status === "New").length,
    topLead: queue[0] ?? null,
  };
}

/** Build the prioritized "Follow up now" list. */
export function buildFollowUpQueue(leads: Lead[], now: Date = new Date()): QueuedLead[] {
  return leads
    .map((lead) => ({ lead, ...priority(lead, now) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aDate = parseISODate(a.lead.nextFollowUpDate)?.getTime() ?? Infinity;
      const bDate = parseISODate(b.lead.nextFollowUpDate)?.getTime() ?? Infinity;
      return aDate - bDate;
    });
}

/** Leads considered "hot": high intent and still open. */
export function isHot(lead: Lead): boolean {
  return !isClosed(lead) && (lead.status === "Proposal sent" || lead.status === "Discovery booked");
}

export interface DashboardMetrics {
  total: number;
  hot: number;
  needsToday: number;
  stale: number;
  revenueAtRisk: number;
}

export function computeMetrics(leads: Lead[], now: Date = new Date()): DashboardMetrics {
  const revenue = computeRevenueAtRisk(leads, now);
  return {
    total: leads.length,
    hot: leads.filter(isHot).length,
    needsToday: leads.filter((l) => needsFollowUpToday(l, now)).length,
    stale: leads.filter((l) => isStale(l, now)).length,
    revenueAtRisk: revenue.total,
  };
}

/** A human-friendly suggested next action for the lead detail page. */
export function suggestedNextAction(lead: Lead, now: Date = new Date()): string {
  if (lead.status === "Won") return "Won — send onboarding details and ask for a referral.";
  if (lead.status === "Lost") return "Lost — archive, or revisit in a future quarter.";

  const sinceContact = daysSinceContact(lead, now);
  const untilFollowUp = daysUntilFollowUp(lead, now);

  if (lead.status === "Proposal sent") {
    return "Follow up on the proposal — confirm they received it and answer open questions.";
  }
  if (lead.status === "New") {
    return "Send a quick intro and propose a short discovery call.";
  }
  if (untilFollowUp !== null && untilFollowUp <= 0) {
    return "A follow-up is due — send a check-in message today.";
  }
  if (isStale(lead, now)) {
    return "This lead has gone quiet — send a light revive message to reopen the conversation.";
  }
  if (lead.status === "Discovery booked") {
    return "Prep for the discovery call and send a confirmation with an agenda.";
  }
  if (sinceContact !== null && sinceContact >= 7) {
    return "It's been a while — check in to keep momentum.";
  }
  return "Keep nurturing — schedule the next touchpoint.";
}
