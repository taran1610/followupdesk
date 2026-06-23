"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { LeadActions } from "@/components/lead-actions";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { relativeDay, parseISODate } from "@/lib/date";
import { needsFollowUpToday } from "@/lib/followups";
import { cn } from "@/lib/utils";

type SortKey = "followup" | "recent" | "value" | "name";

const SORT_LABELS: Record<SortKey, string> = {
  followup: "Next follow-up",
  recent: "Recently added",
  value: "Deal value",
  name: "Name",
};

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("followup");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = leads.filter((lead) => {
      const matchesStatus = status === "all" || lead.status === status;
      const matchesQuery =
        !q ||
        [lead.name, lead.company, lead.email, lead.phone]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "followup": {
          const aDate = parseISODate(a.nextFollowUpDate)?.getTime() ?? Infinity;
          const bDate = parseISODate(b.nextFollowUpDate)?.getTime() ?? Infinity;
          return aDate - bDate;
        }
        case "value":
          return (b.dealValue ?? 0) - (a.dealValue ?? 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return rows;
  }, [leads, query, status, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, company, email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus | "all")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <SelectItem key={key} value={key}>
                Sort: {SORT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasLeads={leads.length > 0} />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next follow-up</TableHead>
                <TableHead className="hidden lg:table-cell">Last contact</TableHead>
                <TableHead className="hidden sm:table-cell">Source</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => {
                const due = needsFollowUpToday(lead);
                return (
                  <TableRow key={lead.id} className="group">
                    <TableCell>
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium hover:underline"
                      >
                        {lead.name}
                      </Link>
                      {lead.email && (
                        <div className="text-muted-foreground truncate text-xs">
                          {lead.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {lead.company ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-sm",
                          due && "text-rose-600 dark:text-rose-400 font-medium"
                        )}
                      >
                        {relativeDay(lead.nextFollowUpDate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                      {relativeDay(lead.lastContactDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                      {lead.source ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(lead.dealValue)}
                    </TableCell>
                    <TableCell>
                      <LeadActions lead={lead} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-muted-foreground text-xs">
        Showing {filtered.length} of {leads.length} leads
      </p>
    </div>
  );
}

function EmptyState({ hasLeads }: { hasLeads: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center">
      <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
        <Users className="size-5" />
      </div>
      <div>
        <p className="text-sm font-medium">
          {hasLeads ? "No leads match your filters" : "No leads yet"}
        </p>
        <p className="text-muted-foreground text-sm">
          {hasLeads
            ? "Try clearing the search or status filter."
            : "Add your first lead to start tracking follow-ups."}
        </p>
      </div>
      {!hasLeads && (
        <LeadFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Add lead
            </Button>
          }
        />
      )}
    </div>
  );
}
