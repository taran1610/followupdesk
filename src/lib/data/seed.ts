import type { ActivityItem, Followup, Lead, LeadNote } from "@/lib/types";
import { addDays, toISODate } from "@/lib/date";

export interface SeedData {
  leads: Lead[];
  notes: LeadNote[];
  followups: Followup[];
  activities: ActivityItem[];
}

/**
 * Demo dataset so the app looks useful immediately. Dates are relative to
 * "now" so the dashboard always has fresh, overdue, and stale leads.
 */
export function buildSeedData(userId: string, now: Date = new Date()): SeedData {
  const iso = (d: Date) => toISODate(d);
  const ts = (d: Date) => d.toISOString();
  const day = (n: number) => iso(addDays(now, n));
  const stamp = (n: number) => ts(addDays(now, n));

  const leads: Lead[] = [
    {
      id: "lead-coach-amara",
      userId,
      name: "Amara Okafor",
      company: "Clarity Coaching Co.",
      email: "amara@claritycoaching.co",
      phone: "+1 415 555 0142",
      status: "Proposal sent",
      source: "Referral",
      dealValue: 6000,
      notes: "Wants a 12-week leadership package. Sent proposal, awaiting sign-off.",
      lastContactDate: day(-4),
      nextFollowUpDate: day(-1),
      createdAt: stamp(-18),
      updatedAt: stamp(-4),
    },
    {
      id: "lead-agency-brightwave",
      userId,
      name: "Diego Santos",
      company: "Brightwave Marketing",
      email: "diego@brightwave.io",
      phone: "+1 212 555 0190",
      status: "Contacted",
      source: "Website",
      dealValue: 9500,
      notes: "Interested in a retainer for paid social. Asked to reconnect this week.",
      lastContactDate: day(-3),
      nextFollowUpDate: day(0),
      createdAt: stamp(-9),
      updatedAt: stamp(-3),
    },
    {
      id: "lead-consulting-northpeak",
      userId,
      name: "Helen Marsh",
      company: "Northpeak Consulting",
      email: "helen@northpeak.com",
      phone: "+1 303 555 0177",
      status: "Waiting",
      source: "Event",
      dealValue: 12000,
      notes: "Met at the ops summit. Went quiet after the first call.",
      lastContactDate: day(-21),
      nextFollowUpDate: day(-7),
      createdAt: stamp(-30),
      updatedAt: stamp(-21),
    },
    {
      id: "lead-inbound-rivera",
      userId,
      name: "Marcus Rivera",
      company: "Rivera Studio",
      email: "marcus@riverastudio.design",
      phone: null,
      status: "New",
      source: "Inbound",
      dealValue: 3500,
      notes: "Filled out the contact form asking about brand strategy coaching.",
      lastContactDate: null,
      nextFollowUpDate: day(0),
      createdAt: stamp(-2),
      updatedAt: stamp(-2),
    },
    {
      id: "lead-won-summit",
      userId,
      name: "Priya Nair",
      company: "Summit Wellness",
      email: "priya@summitwellness.co",
      phone: "+1 646 555 0123",
      status: "Won",
      source: "Referral",
      dealValue: 8000,
      notes: "Signed the 6-month engagement. Kickoff scheduled.",
      lastContactDate: day(-5),
      nextFollowUpDate: null,
      createdAt: stamp(-40),
      updatedAt: stamp(-5),
    },
    {
      id: "lead-lost-fairlane",
      userId,
      name: "Tom Becker",
      company: "Fairlane Partners",
      email: "tom@fairlane.partners",
      phone: "+1 718 555 0166",
      status: "Lost",
      source: "Cold outreach",
      dealValue: 5000,
      notes: "Chose an in-house hire. Open to revisiting next year.",
      lastContactDate: day(-25),
      nextFollowUpDate: null,
      createdAt: stamp(-50),
      updatedAt: stamp(-25),
    },
  ];

  const notes: LeadNote[] = [
    {
      id: "note-1",
      leadId: "lead-coach-amara",
      userId,
      content: "Great discovery call — strong fit. Sending the leadership package proposal.",
      createdAt: stamp(-5),
    },
    {
      id: "note-2",
      leadId: "lead-coach-amara",
      userId,
      content: "Proposal sent via email. She said she'd review with her co-founder.",
      createdAt: stamp(-4),
    },
    {
      id: "note-3",
      leadId: "lead-agency-brightwave",
      userId,
      content: "Quick intro call. They want help with paid social ROI. Reconnect this week.",
      createdAt: stamp(-3),
    },
    {
      id: "note-4",
      leadId: "lead-consulting-northpeak",
      userId,
      content: "Promising first call but no reply to my last two emails.",
      createdAt: stamp(-15),
    },
  ];

  const followups: Followup[] = [
    {
      id: "fu-1",
      leadId: "lead-coach-amara",
      userId,
      channel: "email",
      subject: "Following up on your leadership package",
      body: "Hi Amara, just checking in to see if you and your co-founder had a chance to review the proposal.",
      status: "scheduled",
      scheduledFor: stamp(-1),
      sentAt: null,
      createdAt: stamp(-4),
    },
    {
      id: "fu-2",
      leadId: "lead-agency-brightwave",
      userId,
      channel: "email",
      subject: "Reconnecting on paid social",
      body: "Hi Diego, following up as promised — happy to walk through how I'd approach your paid social retainer.",
      status: "scheduled",
      scheduledFor: stamp(0),
      sentAt: null,
      createdAt: stamp(-3),
    },
  ];

  const activities: ActivityItem[] = [
    {
      id: "act-1",
      type: "followup_scheduled",
      leadId: "lead-agency-brightwave",
      leadName: "Diego Santos",
      description: "Scheduled an email follow-up",
      createdAt: stamp(-3),
    },
    {
      id: "act-2",
      type: "status_changed",
      leadId: "lead-coach-amara",
      leadName: "Amara Okafor",
      description: "Status changed to Proposal sent",
      createdAt: stamp(-4),
    },
    {
      id: "act-3",
      type: "note_added",
      leadId: "lead-consulting-northpeak",
      leadName: "Helen Marsh",
      description: "Added a note",
      createdAt: stamp(-15),
    },
    {
      id: "act-4",
      type: "status_changed",
      leadId: "lead-won-summit",
      leadName: "Priya Nair",
      description: "Status changed to Won",
      createdAt: stamp(-5),
    },
    {
      id: "act-5",
      type: "lead_created",
      leadId: "lead-inbound-rivera",
      leadName: "Marcus Rivera",
      description: "New inbound lead added",
      createdAt: stamp(-2),
    },
  ];

  return { leads, notes, followups, activities };
}
