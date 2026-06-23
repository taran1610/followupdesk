import type {
  ActivityItem,
  AiGeneration,
  AiGenerationInput,
  AiGenerationOutput,
  Followup,
  FollowupChannel,
  Lead,
  LeadNote,
  NewLeadInput,
  UpdateLeadInput,
} from "@/lib/types";

export interface CreateFollowupInput {
  leadId: string;
  channel: FollowupChannel;
  subject?: string | null;
  body?: string | null;
  scheduledFor?: string | null;
}

export interface Repository {
  listLeads(userId: string): Promise<Lead[]>;
  getLead(userId: string, leadId: string): Promise<Lead | null>;
  createLead(userId: string, input: NewLeadInput): Promise<Lead>;
  updateLead(userId: string, leadId: string, patch: UpdateLeadInput): Promise<Lead | null>;
  deleteLead(userId: string, leadId: string): Promise<void>;

  listNotes(userId: string, leadId: string): Promise<LeadNote[]>;
  addNote(userId: string, leadId: string, content: string): Promise<LeadNote>;

  listFollowups(userId: string, leadId: string): Promise<Followup[]>;
  createFollowup(userId: string, input: CreateFollowupInput): Promise<Followup>;

  listRecentActivity(userId: string, limit?: number): Promise<ActivityItem[]>;

  saveGeneration(
    userId: string,
    input: AiGenerationInput,
    output: AiGenerationOutput,
    leadId: string | null
  ): Promise<AiGeneration>;
}
