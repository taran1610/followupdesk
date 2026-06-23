import type {
  ActivityItem,
  AiGeneration,
  AiGenerationInput,
  AiGenerationOutput,
  Followup,
  Lead,
  LeadNote,
  LeadStatus,
  NewLeadInput,
  UpdateLeadInput,
} from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CreateFollowupInput, Repository } from "./repository";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapLead(row: any): Lead {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    status: row.status as LeadStatus,
    source: row.source,
    dealValue: row.deal_value === null ? null : Number(row.deal_value),
    notes: row.notes,
    lastContactDate: row.last_contact_date,
    nextFollowUpDate: row.next_follow_up_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapNote(row: any): LeadNote {
  return {
    id: row.id,
    leadId: row.lead_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapFollowup(row: any): Followup {
  return {
    id: row.id,
    leadId: row.lead_id,
    userId: row.user_id,
    channel: row.channel,
    subject: row.subject,
    body: row.body,
    status: row.status,
    scheduledFor: row.scheduled_for,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

function leadPayload(input: NewLeadInput | UpdateLeadInput) {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.company !== undefined) payload.company = input.company;
  if (input.email !== undefined) payload.email = input.email;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.status !== undefined) payload.status = input.status;
  if (input.source !== undefined) payload.source = input.source;
  if (input.dealValue !== undefined) payload.deal_value = input.dealValue;
  if (input.notes !== undefined) payload.notes = input.notes;
  if (input.lastContactDate !== undefined) payload.last_contact_date = input.lastContactDate;
  if (input.nextFollowUpDate !== undefined) payload.next_follow_up_date = input.nextFollowUpDate;
  return payload;
}

export class SupabaseRepository implements Repository {
  async listLeads(_userId: string): Promise<Lead[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapLead);
  }

  async getLead(_userId: string, leadId: string): Promise<Lead | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapLead(data) : null;
  }

  async createLead(userId: string, input: NewLeadInput): Promise<Lead> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("leads")
      .insert({ ...leadPayload(input), user_id: userId, status: input.status ?? "New" })
      .select("*")
      .single();
    if (error) throw error;
    return mapLead(data);
  }

  async updateLead(
    _userId: string,
    leadId: string,
    patch: UpdateLeadInput
  ): Promise<Lead | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("leads")
      .update(leadPayload(patch))
      .eq("id", leadId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? mapLead(data) : null;
  }

  async deleteLead(_userId: string, leadId: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    if (error) throw error;
  }

  async listNotes(_userId: string, leadId: string): Promise<LeadNote[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapNote);
  }

  async addNote(userId: string, leadId: string, content: string): Promise<LeadNote> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("lead_notes")
      .insert({ lead_id: leadId, user_id: userId, content })
      .select("*")
      .single();
    if (error) throw error;
    return mapNote(data);
  }

  async listFollowups(_userId: string, leadId: string): Promise<Followup[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("followups")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapFollowup);
  }

  async createFollowup(userId: string, input: CreateFollowupInput): Promise<Followup> {
    const supabase = await createSupabaseServerClient();
    const status = input.status ?? "scheduled";
    const { data, error } = await supabase
      .from("followups")
      .insert({
        lead_id: input.leadId,
        user_id: userId,
        channel: input.channel,
        subject: input.subject ?? null,
        body: input.body ?? null,
        status,
        scheduled_for: input.scheduledFor ?? null,
        sent_at: input.sentAt ?? (status === "sent" ? new Date().toISOString() : null),
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapFollowup(data);
  }

  async listRecentActivity(_userId: string, limit = 10): Promise<ActivityItem[]> {
    const supabase = await createSupabaseServerClient();
    // Derive a lightweight activity feed from recent notes and followups.
    const [{ data: notes }, { data: followups }] = await Promise.all([
      supabase
        .from("lead_notes")
        .select("id, lead_id, content, created_at, leads(name)")
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("followups")
        .select("id, lead_id, channel, created_at, leads(name)")
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    const items: ActivityItem[] = [];
    for (const n of notes ?? []) {
      items.push({
        id: `note-${n.id}`,
        type: "note_added",
        leadId: n.lead_id,
        leadName: (n as any).leads?.name ?? "Lead",
        description: "Added a note",
        createdAt: n.created_at,
      });
    }
    for (const f of followups ?? []) {
      items.push({
        id: `fu-${f.id}`,
        type: "followup_scheduled",
        leadId: f.lead_id,
        leadName: (f as any).leads?.name ?? "Lead",
        description: `Scheduled a ${f.channel} follow-up`,
        createdAt: f.created_at,
      });
    }
    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async saveGeneration(
    userId: string,
    input: AiGenerationInput,
    output: AiGenerationOutput,
    leadId: string | null
  ): Promise<AiGeneration> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ai_generations")
      .insert({
        lead_id: leadId,
        user_id: userId,
        prompt_input: input,
        generated_output: output,
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      leadId: data.lead_id,
      userId: data.user_id,
      promptInput: data.prompt_input,
      generatedOutput: data.generated_output,
      createdAt: data.created_at,
    };
  }
}
