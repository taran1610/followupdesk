import type {
  ActivityItem,
  ActivityType,
  AiGeneration,
  AiGenerationInput,
  AiGenerationOutput,
  Followup,
  Lead,
  LeadNote,
  NewLeadInput,
  UpdateLeadInput,
} from "@/lib/types";
import type { CreateFollowupInput, Repository } from "./repository";
import { buildSeedData } from "./seed";

interface UserData {
  leads: Lead[];
  notes: LeadNote[];
  followups: Followup[];
  activities: ActivityItem[];
  generations: AiGeneration[];
}

interface MockDb {
  users: Map<string, UserData>;
}

// Persist across hot-reloads in dev by stashing on globalThis.
const globalForMock = globalThis as unknown as { __fudMockDb?: MockDb };

function getDb(): MockDb {
  if (!globalForMock.__fudMockDb) {
    globalForMock.__fudMockDb = { users: new Map() };
  }
  return globalForMock.__fudMockDb;
}

function getUserData(userId: string): UserData {
  const db = getDb();
  let data = db.users.get(userId);
  if (!data) {
    const seed = buildSeedData(userId);
    data = { ...seed, generations: [] };
    db.users.set(userId, data);
  }
  return data;
}

function uid(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${rand}`;
}

function logActivity(
  data: UserData,
  type: ActivityType,
  lead: Pick<Lead, "id" | "name">,
  description: string
) {
  data.activities.unshift({
    id: uid("act"),
    type,
    leadId: lead.id,
    leadName: lead.name,
    description,
    createdAt: new Date().toISOString(),
  });
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export class MockRepository implements Repository {
  async listLeads(userId: string): Promise<Lead[]> {
    const data = getUserData(userId);
    return clone(
      [...data.leads].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }

  async getLead(userId: string, leadId: string): Promise<Lead | null> {
    const data = getUserData(userId);
    const lead = data.leads.find((l) => l.id === leadId);
    return lead ? clone(lead) : null;
  }

  async createLead(userId: string, input: NewLeadInput): Promise<Lead> {
    const data = getUserData(userId);
    const now = new Date().toISOString();
    const lead: Lead = {
      id: uid("lead"),
      userId,
      name: input.name,
      company: input.company ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      status: input.status ?? "New",
      source: input.source ?? null,
      dealValue: input.dealValue ?? null,
      notes: input.notes ?? null,
      lastContactDate: input.lastContactDate ?? null,
      nextFollowUpDate: input.nextFollowUpDate ?? null,
      createdAt: now,
      updatedAt: now,
    };
    data.leads.unshift(lead);
    logActivity(data, "lead_created", lead, "New lead added");
    return clone(lead);
  }

  async updateLead(
    userId: string,
    leadId: string,
    patch: UpdateLeadInput
  ): Promise<Lead | null> {
    const data = getUserData(userId);
    const lead = data.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    const prevStatus = lead.status;
    Object.assign(lead, {
      ...patch,
      company: patch.company !== undefined ? patch.company : lead.company,
    });
    lead.updatedAt = new Date().toISOString();
    if (patch.status && patch.status !== prevStatus) {
      logActivity(data, "status_changed", lead, `Status changed to ${patch.status}`);
    }
    return clone(lead);
  }

  async deleteLead(userId: string, leadId: string): Promise<void> {
    const data = getUserData(userId);
    data.leads = data.leads.filter((l) => l.id !== leadId);
    data.notes = data.notes.filter((n) => n.leadId !== leadId);
    data.followups = data.followups.filter((f) => f.leadId !== leadId);
    data.activities = data.activities.filter((a) => a.leadId !== leadId);
  }

  async listNotes(userId: string, leadId: string): Promise<LeadNote[]> {
    const data = getUserData(userId);
    return clone(
      data.notes
        .filter((n) => n.leadId === leadId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }

  async addNote(userId: string, leadId: string, content: string): Promise<LeadNote> {
    const data = getUserData(userId);
    const note: LeadNote = {
      id: uid("note"),
      leadId,
      userId,
      content,
      createdAt: new Date().toISOString(),
    };
    data.notes.unshift(note);
    const lead = data.leads.find((l) => l.id === leadId);
    if (lead) logActivity(data, "note_added", lead, "Added a note");
    return clone(note);
  }

  async listFollowups(userId: string, leadId: string): Promise<Followup[]> {
    const data = getUserData(userId);
    return clone(
      data.followups
        .filter((f) => f.leadId === leadId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }

  async createFollowup(userId: string, input: CreateFollowupInput): Promise<Followup> {
    const data = getUserData(userId);
    const status = input.status ?? "scheduled";
    const sentAt =
      input.sentAt ?? (status === "sent" ? new Date().toISOString() : null);
    const followup: Followup = {
      id: uid("fu"),
      leadId: input.leadId,
      userId,
      channel: input.channel,
      subject: input.subject ?? null,
      body: input.body ?? null,
      status,
      scheduledFor: input.scheduledFor ?? null,
      sentAt,
      createdAt: new Date().toISOString(),
    };
    data.followups.unshift(followup);
    const lead = data.leads.find((l) => l.id === input.leadId);
    if (lead) {
      logActivity(
        data,
        status === "sent" ? "contacted" : "followup_scheduled",
        lead,
        status === "sent"
          ? `Sent a ${input.channel} follow-up`
          : `Scheduled a ${input.channel} follow-up`
      );
    }
    return clone(followup);
  }

  async listRecentActivity(userId: string, limit = 10): Promise<ActivityItem[]> {
    const data = getUserData(userId);
    return clone(
      [...data.activities]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
    );
  }

  async saveGeneration(
    userId: string,
    input: AiGenerationInput,
    output: AiGenerationOutput,
    leadId: string | null
  ): Promise<AiGeneration> {
    const data = getUserData(userId);
    const generation: AiGeneration = {
      id: uid("gen"),
      leadId,
      userId,
      promptInput: input,
      generatedOutput: output,
      createdAt: new Date().toISOString(),
    };
    data.generations.unshift(generation);
    if (leadId) {
      const lead = data.leads.find((l) => l.id === leadId);
      if (lead) logActivity(data, "ai_generated", lead, "Drafted an AI follow-up");
    }
    return clone(generation);
  }
}
