import "server-only";
import OpenAI from "openai";
import { isOpenAIConfigured } from "@/lib/config";
import { addDaysISO, todayISODate } from "@/lib/date";
import {
  AI_GOAL_LABELS,
  type AiGenerationInput,
  type AiGenerationOutput,
  type AiGoal,
  type AiTone,
} from "@/lib/types";

export interface GenerateResult {
  output: AiGenerationOutput;
  source: "openai" | "mock";
  warning?: string;
}

const GOAL_FOLLOWUP_DAYS: Record<AiGoal, number> = {
  book_call: 3,
  check_in: 5,
  revive_stale: 7,
  follow_up_proposal: 2,
  close_deal: 2,
};

export async function generateFollowUp(
  input: AiGenerationInput
): Promise<GenerateResult> {
  if (isOpenAIConfigured()) {
    try {
      const output = await generateWithOpenAI(input);
      return { output, source: "openai" };
    } catch (err) {
      return {
        output: mockGenerate(input),
        source: "mock",
        warning:
          err instanceof Error
            ? `AI service unavailable (${err.message}). Showing a draft template instead.`
            : "AI service unavailable. Showing a draft template instead.",
      };
    }
  }
  return { output: mockGenerate(input), source: "mock" };
}

async function generateWithOpenAI(
  input: AiGenerationInput
): Promise<AiGenerationOutput> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const system =
    "You are an assistant for coaches, consultants, and small agencies who helps write concise, warm, non-pushy sales follow-ups. Always return valid JSON.";

  const user = `Write a follow-up for this lead.
Lead name: ${input.leadName}
Business type: ${input.businessType}
Current status: ${input.status}
Last interaction notes: ${input.notes || "none"}
Tone: ${input.tone}
Goal: ${AI_GOAL_LABELS[input.goal]}

Return JSON with exactly these keys:
- "subject": a short email subject line
- "body": a warm email body (2-4 short paragraphs, no placeholders like [Name], sign as the user)
- "sms": a 1-2 sentence SMS/DM version under 320 characters
- "suggestedNextFollowUpDate": an ISO date (YYYY-MM-DD) for the next follow-up`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<AiGenerationOutput>;

  return {
    subject: parsed.subject?.trim() || defaultSubject(input),
    body: parsed.body?.trim() || mockGenerate(input).body,
    sms: parsed.sms?.trim() || mockGenerate(input).sms,
    suggestedNextFollowUpDate:
      normalizeDate(parsed.suggestedNextFollowUpDate) ?? defaultNextDate(input),
  };
}

function normalizeDate(value?: string): string | null {
  if (!value) return null;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value.trim());
  return match ? match[0] : null;
}

function defaultNextDate(input: AiGenerationInput): string {
  return addDaysISO(todayISODate(), GOAL_FOLLOWUP_DAYS[input.goal] ?? 3);
}

function defaultSubject(input: AiGenerationInput): string {
  const first = input.leadName.split(" ")[0] || "there";
  switch (input.goal) {
    case "book_call":
      return `Quick call this week, ${first}?`;
    case "check_in":
      return `Checking in, ${first}`;
    case "revive_stale":
      return `Still here when you're ready, ${first}`;
    case "follow_up_proposal":
      return `Following up on your proposal`;
    case "close_deal":
      return `Ready to get started, ${first}?`;
  }
}

const TONE_OPENERS: Record<AiTone, string> = {
  friendly: "Hope you're having a good week!",
  direct: "Following up on where we left off.",
  premium: "I wanted to personally reach out and make sure you have everything you need.",
  casual: "Just wanted to drop you a quick note.",
};

const TONE_SIGNOFFS: Record<AiTone, string> = {
  friendly: "Talk soon,",
  direct: "Best,",
  premium: "Warm regards,",
  casual: "Cheers,",
};

export function mockGenerate(input: AiGenerationInput): AiGenerationOutput {
  const first = input.leadName.split(" ")[0] || "there";
  const opener = TONE_OPENERS[input.tone];
  const signoff = TONE_SIGNOFFS[input.tone];

  const goalLine = goalParagraph(input, first);
  const noteLine = input.notes
    ? `Last time we spoke, I noted: "${truncate(input.notes, 140)}". I'd love to pick that back up.`
    : "I'd love to find the right next step for you.";

  const body = [
    `Hi ${first},`,
    `${opener} ${noteLine}`,
    goalLine,
    `${signoff}\nYour name`,
  ].join("\n\n");

  const sms = `Hi ${first}, ${smsLine(input)} — open to a quick reply?`;

  return {
    subject: defaultSubject(input),
    body,
    sms: truncate(sms, 300),
    suggestedNextFollowUpDate: defaultNextDate(input),
  };
}

function goalParagraph(input: AiGenerationInput, first: string): string {
  switch (input.goal) {
    case "book_call":
      return `Would you be open to a short call this week? I can share how I'd help${input.businessType ? ` ${input.businessType}` : " you"} reach the next milestone. Here are a couple of times that work — happy to adjust to your schedule.`;
    case "check_in":
      return `No pressure at all — I just wanted to check in and see how things are going on your end, and whether now feels like the right time to move forward.`;
    case "revive_stale":
      return `I know things get busy, ${first}. If the timing wasn't right before, I'm still here whenever you'd like to revisit it — even a one-line reply tells me where to focus.`;
    case "follow_up_proposal":
      return `I wanted to follow up on the proposal I sent over. Do you have any questions, or anything you'd like me to adjust? I'm happy to walk through it together.`;
    case "close_deal":
      return `It sounds like we're aligned on the plan. If you're ready, I can send over the agreement today and we can get started right away. Just say the word.`;
  }
}

function smsLine(input: AiGenerationInput): string {
  switch (input.goal) {
    case "book_call":
      return "wanted to see if you're free for a quick call this week";
    case "check_in":
      return "just checking in to see how things are going";
    case "revive_stale":
      return "still happy to help whenever the timing's right";
    case "follow_up_proposal":
      return "following up on the proposal I sent";
    case "close_deal":
      return "ready to get you started whenever you are";
  }
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}
