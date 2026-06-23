import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Lightbulb,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
  StickyNote,
  Tag,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/data";
import { suggestedNextAction } from "@/lib/followups";
import { formatCurrency } from "@/lib/format";
import { formatDate, formatDateTime, relativeDay, relativeFromNow } from "@/lib/date";
import { StatusBadge } from "@/components/status-badge";
import { LeadActions } from "@/components/lead-actions";
import { QuickContactButton } from "@/components/quick-contact-button";
import { CreateReminderButton } from "@/components/create-reminder-button";
import { AddNoteForm } from "@/components/add-note-form";
import { AiGenerator } from "@/components/ai-generator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { FollowupChannel } from "@/lib/types";

const CHANNEL_ICON: Record<FollowupChannel, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  dm: MessageSquare,
  call: Phone,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const lead = await getRepository().getLead(user.id, id);
  return { title: lead ? lead.name : "Lead" };
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const repo = getRepository();
  const lead = await repo.getLead(user.id, id);
  if (!lead) notFound();

  const [notes, followups] = await Promise.all([
    repo.listNotes(user.id, id),
    repo.listFollowups(user.id, id),
  ]);

  const isClosed = lead.status === "Won" || lead.status === "Lost";

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        nativeButton={false}
        render={<Link href="/leads" />}
      >
        <ArrowLeft className="size-4" />
        Back to leads
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
            <StatusBadge status={lead.status} />
          </div>
          {lead.company && (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Building2 className="size-4" />
              {lead.company}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isClosed && <QuickContactButton leadId={lead.id} />}
          <CreateReminderButton leadId={lead.id} />
          <LeadActions lead={lead} />
        </div>
      </div>

      {/* Suggested next action */}
      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <div className="bg-muted text-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md">
            <Lightbulb className="size-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Suggested next action</p>
            <p className="text-muted-foreground text-sm">{suggestedNextAction(lead)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lead details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow icon={Mail} label="Email">
              {lead.email ? (
                <a href={`mailto:${lead.email}`} className="hover:underline">
                  {lead.email}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow icon={Phone} label="Phone">
              {lead.phone ? (
                <a href={`tel:${lead.phone}`} className="hover:underline">
                  {lead.phone}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow icon={Tag} label="Source">
              {lead.source ?? "—"}
            </DetailRow>
            <DetailRow icon={Tag} label="Deal value">
              {formatCurrency(lead.dealValue)}
            </DetailRow>
            <Separator />
            <DetailRow icon={CalendarClock} label="Last contact">
              {lead.lastContactDate
                ? `${formatDate(lead.lastContactDate)} (${relativeDay(lead.lastContactDate)})`
                : "Never"}
            </DetailRow>
            <DetailRow icon={CalendarClock} label="Next follow-up">
              {lead.nextFollowUpDate
                ? `${formatDate(lead.nextFollowUpDate)} (${relativeDay(lead.nextFollowUpDate)})`
                : "Not scheduled"}
            </DetailRow>
            <DetailRow icon={CalendarClock} label="Added">
              {formatDate(lead.createdAt)}
            </DetailRow>
            {lead.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Summary</p>
                  <p className="whitespace-pre-wrap">{lead.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notes timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <StickyNote className="size-4" />
              Notes
            </CardTitle>
            <CardDescription>Keep a running log of every interaction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddNoteForm leadId={lead.id} />
            {notes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No notes yet.</p>
            ) : (
              <ol className="space-y-4">
                {notes.map((note) => (
                  <li key={note.id} className="relative pl-5">
                    <span className="bg-border absolute top-1.5 left-0 size-2 rounded-full" />
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-muted-foreground text-xs">
                      {relativeFromNow(note.createdAt)} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            Draft a follow-up
          </CardTitle>
          <CardDescription>
            Generate an email and SMS tailored to this lead. Everything is editable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiGenerator lead={lead} />
        </CardContent>
      </Card>

      {/* Follow-up history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-4" />
            Follow-up history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {followups.length === 0 ? (
            <p className="text-muted-foreground text-sm">No follow-ups scheduled yet.</p>
          ) : (
            <ul className="divide-y">
              {followups.map((fu) => {
                const Icon = CHANNEL_ICON[fu.channel] ?? Mail;
                return (
                  <li key={fu.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {fu.subject || `${fu.channel.toUpperCase()} follow-up`}
                      </p>
                      {fu.body && (
                        <p className="text-muted-foreground truncate text-sm">{fu.body}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        <span className="capitalize">{fu.status}</span>
                        {fu.scheduledFor
                          ? ` · for ${formatDate(fu.scheduledFor)}`
                          : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-right">{children}</span>
    </div>
  );
}
