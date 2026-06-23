"use server";

import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import { generateFollowUp } from "@/lib/ai/generate";
import {
  AI_GOALS,
  AI_TONES,
  type AiGenerationInput,
  type AiGenerationOutput,
} from "@/lib/types";

export interface GenerateActionResult {
  ok: boolean;
  error?: string;
  output?: AiGenerationOutput;
  source?: "openai" | "mock";
  warning?: string;
}

export async function generateFollowUpAction(
  input: AiGenerationInput,
  leadId: string | null
): Promise<GenerateActionResult> {
  const user = await requireUser();

  if (!input.leadName?.trim()) {
    return { ok: false, error: "Lead name is required." };
  }
  if (!AI_TONES.includes(input.tone)) {
    return { ok: false, error: "Pick a valid tone." };
  }
  if (!AI_GOALS.includes(input.goal)) {
    return { ok: false, error: "Pick a valid goal." };
  }

  try {
    const result = await generateFollowUp(input);
    // Persist the generation (best-effort; don't fail the request on this).
    try {
      await getRepository().saveGeneration(user.id, input, result.output, leadId);
    } catch {
      // ignore persistence errors in MVP
    }
    return {
      ok: true,
      output: result.output,
      source: result.source,
      warning: result.warning,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to generate a follow-up.",
    };
  }
}
