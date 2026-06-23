export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Discovery booked",
  "Proposal sent",
  "Waiting",
  "Won",
  "Lost",
  "Stale",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "Referral",
  "Website",
  "Cold outreach",
  "Inbound",
  "Event",
  "Social",
  "Other",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface Lead {
  id: string;
  userId: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  source: string | null;
  dealValue: number | null;
  notes: string | null;
  lastContactDate: string | null; // YYYY-MM-DD
  nextFollowUpDate: string | null; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export type NewLeadInput = {
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: LeadStatus;
  source?: string | null;
  dealValue?: number | null;
  notes?: string | null;
  lastContactDate?: string | null;
  nextFollowUpDate?: string | null;
};

export type UpdateLeadInput = Partial<NewLeadInput>;

export interface LeadNote {
  id: string;
  leadId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export const FOLLOWUP_CHANNELS = ["email", "sms", "dm", "call"] as const;
export type FollowupChannel = (typeof FOLLOWUP_CHANNELS)[number];

export const FOLLOWUP_STATUSES = ["scheduled", "sent", "cancelled"] as const;
export type FollowupStatus = (typeof FOLLOWUP_STATUSES)[number];

export interface Followup {
  id: string;
  leadId: string;
  userId: string;
  channel: FollowupChannel;
  subject: string | null;
  body: string | null;
  status: FollowupStatus;
  scheduledFor: string | null; // ISO timestamp
  sentAt: string | null; // ISO timestamp
  createdAt: string;
}

export const AI_TONES = ["friendly", "direct", "premium", "casual"] as const;
export type AiTone = (typeof AI_TONES)[number];

export const AI_GOALS = [
  "book_call",
  "check_in",
  "revive_stale",
  "follow_up_proposal",
  "close_deal",
] as const;
export type AiGoal = (typeof AI_GOALS)[number];

export interface AiGenerationInput {
  leadName: string;
  businessType: string;
  status: string;
  notes: string;
  tone: AiTone;
  goal: AiGoal;
  /** Recent Gmail thread context from Email Brain sync. */
  emailContext?: string;
}

export interface AiGenerationOutput {
  subject: string;
  body: string;
  sms: string;
  suggestedNextFollowUpDate: string; // YYYY-MM-DD
}

export interface AiGeneration {
  id: string;
  leadId: string | null;
  userId: string;
  promptInput: AiGenerationInput;
  generatedOutput: AiGenerationOutput;
  createdAt: string;
}

export type ActivityType =
  | "lead_created"
  | "note_added"
  | "followup_scheduled"
  | "status_changed"
  | "contacted"
  | "ai_generated";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  leadId: string;
  leadName: string;
  description: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
}

export const AI_GOAL_LABELS: Record<AiGoal, string> = {
  book_call: "Book a call",
  check_in: "Check in",
  revive_stale: "Revive stale lead",
  follow_up_proposal: "Follow up on proposal",
  close_deal: "Close the deal",
};

export const AI_TONE_LABELS: Record<AiTone, string> = {
  friendly: "Friendly",
  direct: "Direct",
  premium: "Premium",
  casual: "Casual",
};
