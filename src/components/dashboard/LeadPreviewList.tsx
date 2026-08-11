import Link from "next/link";
import { EmptyState } from "@/components/common";
import { StatusBadge } from "@/components/leads/StatusBadge";
import type { LeadDTO } from "@/types";

export function LeadPreviewList({ leads, emptyMessage }: { leads: LeadDTO[]; emptyMessage: string }) {
  if (leads.length === 0) {
    return <EmptyState title="Nothing here yet" description={emptyMessage} />;
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {leads.map((lead) => (
        <li key={lead.id} className="flex items-center justify-between gap-3 py-3">
          <Link href={`/leads?open=${lead.id}`} className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{lead.name}</p>
            <p className="truncate text-xs text-ink-soft">{lead.company}</p>
          </Link>
          <StatusBadge status={lead.status} />
        </li>
      ))}
    </ul>
  );
}
