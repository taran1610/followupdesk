"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Info,
  Loader2,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { CreateReminderButton } from "@/components/create-reminder-button";
import { SendEmailButton } from "@/components/send-email-button";
import {
  AI_GOAL_LABELS,
  AI_GOALS,
  AI_TONE_LABELS,
  AI_TONES,
  type AiGenerationOutput,
  type AiGoal,
  type AiTone,
  type Lead,
} from "@/lib/types";
import { generateFollowUpAction } from "@/app/actions/ai";

export function AiGenerator({
  lead,
  gmailConnected = false,
}: {
  lead?: Lead;
  gmailConnected?: boolean;
}) {
  const [leadName, setLeadName] = useState(lead?.name ?? "");
  const [businessType, setBusinessType] = useState(lead?.company ?? "");
  const [status, setStatus] = useState<string>(lead?.status ?? "New");
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [tone, setTone] = useState<AiTone>("friendly");
  const [goal, setGoal] = useState<AiGoal>(
    lead?.status === "Proposal sent" ? "follow_up_proposal" : "book_call"
  );

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<"openai" | "mock" | null>(null);
  const [output, setOutput] = useState<AiGenerationOutput | null>(null);

  function handleGenerate() {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await generateFollowUpAction(
        { leadName, businessType, status, notes, tone, goal },
        lead?.id ?? null
      );
      if (result.ok && result.output) {
        setOutput(result.output);
        setSource(result.source ?? null);
        setWarning(result.warning ?? null);
        toast.success("Draft ready");
      } else {
        setError(result.error ?? "Failed to generate a follow-up.");
        toast.error(result.error ?? "Failed to generate");
      }
    });
  }

  function patch(part: Partial<AiGenerationOutput>) {
    setOutput((prev) => (prev ? { ...prev, ...part } : prev));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {!lead && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ai-leadName">Lead name</Label>
              <Input
                id="ai-leadName"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Amara Okafor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-business">Business type</Label>
              <Input
                id="ai-business"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Leadership coaching"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ai-status">Current status</Label>
            <Input
              id="ai-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-tone">Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as AiTone)}>
              <SelectTrigger id="ai-tone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {AI_TONE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-goal">Goal</Label>
          <Select value={goal} onValueChange={(v) => setGoal(v as AiGoal)}>
            <SelectTrigger id="ai-goal" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_GOALS.map((g) => (
                <SelectItem key={g} value={g}>
                  {AI_GOAL_LABELS[g]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-notes">Last interaction notes</Label>
          <Textarea
            id="ai-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="What happened last? What do they care about?"
          />
        </div>

        <Button onClick={handleGenerate} disabled={isPending || !leadName.trim()} className="w-full">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Draft follow-up
        </Button>

        {error && (
          <p className="text-destructive flex items-center gap-2 text-sm" role="alert">
            <AlertTriangle className="size-4" />
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {isPending && (
          <div className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {!isPending && !output && (
          <div className="text-muted-foreground flex h-full min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
            <Sparkles className="size-6" />
            <p className="text-sm">
              Fill in the details and draft a follow-up. You can edit everything before
              sending.
            </p>
          </div>
        )}

        {!isPending && output && (
          <div className="space-y-4">
            {warning ? (
              <p className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <AlertTriangle className="size-3.5 shrink-0" />
                {warning}
              </p>
            ) : (
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <Info className="size-3.5" />
                {source === "openai"
                  ? "Generated with OpenAI."
                  : "Generated with the built-in template engine."}{" "}
                Edit before you send.
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="out-subject" className="flex items-center gap-1.5">
                  <Mail className="size-3.5" /> Email subject
                </Label>
                <CopyButton value={output.subject} size="icon" label="Copy subject" />
              </div>
              <Input
                id="out-subject"
                value={output.subject}
                onChange={(e) => patch({ subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="out-body">Email body</Label>
                <CopyButton value={output.body} size="icon" label="Copy body" />
              </div>
              <Textarea
                id="out-body"
                value={output.body}
                onChange={(e) => patch({ body: e.target.value })}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="out-sms" className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5" /> SMS / DM
                </Label>
                <CopyButton value={output.sms} size="icon" label="Copy SMS" />
              </div>
              <Textarea
                id="out-sms"
                value={output.sms}
                onChange={(e) => patch({ sms: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <div className="space-y-1">
                <Label htmlFor="out-date" className="text-xs">
                  Suggested next follow-up
                </Label>
                <Input
                  id="out-date"
                  type="date"
                  value={output.suggestedNextFollowUpDate}
                  onChange={(e) => patch({ suggestedNextFollowUpDate: e.target.value })}
                  className="w-44"
                />
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <CopyButton value={`${output.subject}\n\n${output.body}`} label="Copy email" />
                {lead && (
                  <>
                    <SendEmailButton
                      leadId={lead.id}
                      leadEmail={lead.email}
                      subject={output.subject}
                      body={output.body}
                      suggestedNextFollowUpDate={output.suggestedNextFollowUpDate}
                      gmailConnected={gmailConnected}
                    />
                    <CreateReminderButton
                      leadId={lead.id}
                      triggerLabel="Save as reminder"
                      variant="outline"
                      defaults={{
                        channel: "email",
                        subject: output.subject,
                        body: output.body,
                        scheduledFor: output.suggestedNextFollowUpDate,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
