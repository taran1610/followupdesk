import type { Lead, NewLeadInput } from "@/lib/types";
import { addDaysISO, todayISODate } from "@/lib/date";

export const SAMPLE_LEAD_EMAILS = [
  "sarah@johnsoncoaching.com",
  "mike@brightwave.io",
  "alex@summitwellness.co",
  "marcus@riverastudio.design",
  "helen@northpeak.com",
] as const;

export function isSampleLead(lead: Pick<Lead, "email">): boolean {
  if (!lead.email) return false;
  return SAMPLE_LEAD_EMAILS.includes(
    lead.email.toLowerCase() as (typeof SAMPLE_LEAD_EMAILS)[number]
  );
}

export function buildSampleLeads(): NewLeadInput[] {
  const today = todayISODate();
  return [
    {
      name: "Sarah Johnson",
      company: "Johnson Coaching",
      email: "sarah@johnsoncoaching.com",
      status: "Proposal sent",
      source: "Referral",
      dealValue: 2500,
      notes: "Sent proposal 4 days ago. Waiting on sign-off from her partner.",
      lastContactDate: addDaysISO(today, -4),
      nextFollowUpDate: addDaysISO(today, -1),
    },
    {
      name: "Mike Agency",
      company: "Brightwave Marketing",
      email: "mike@brightwave.io",
      status: "Waiting",
      source: "Website",
      dealValue: 5500,
      notes: "Interested in a retainer. No reply in 12 days.",
      lastContactDate: addDaysISO(today, -12),
      nextFollowUpDate: today,
    },
    {
      name: "Alex Coach",
      company: "Summit Wellness",
      email: "alex@summitwellness.co",
      status: "Discovery booked",
      source: "Inbound",
      dealValue: 4000,
      notes: "Discovery call yesterday — send recap and next steps.",
      lastContactDate: addDaysISO(today, -1),
      nextFollowUpDate: today,
    },
    {
      name: "Marcus Rivera",
      company: "Rivera Studio",
      email: "marcus@riverastudio.design",
      status: "New",
      source: "Inbound",
      dealValue: 3500,
      notes: "Filled out contact form asking about brand strategy coaching.",
      nextFollowUpDate: today,
    },
    {
      name: "Helen Marsh",
      company: "Northpeak Consulting",
      email: "helen@northpeak.com",
      status: "Stale",
      source: "Event",
      dealValue: 12000,
      notes: "High-value lead gone quiet after strong first call.",
      lastContactDate: addDaysISO(today, -18),
      nextFollowUpDate: addDaysISO(today, -3),
    },
  ];
}

export function partitionLeadsForDashboard(
  allLeads: Lead[],
  opts: { hasGmailData: boolean }
): {
  leads: Lead[];
  hiddenSampleCount: number;
  showRemoveSampleBanner: boolean;
} {
  const sampleLeads = allLeads.filter(isSampleLead);
  const realLeads = allLeads.filter((l) => !isSampleLead(l));
  const hideSamples = realLeads.length > 0 || opts.hasGmailData;

  return {
    leads: hideSamples ? realLeads : allLeads,
    hiddenSampleCount: hideSamples ? sampleLeads.length : 0,
    showRemoveSampleBanner: hideSamples && sampleLeads.length > 0,
  };
}
