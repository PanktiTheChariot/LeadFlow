"use client";

import {
  Button,
  EmptyState,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/common";
import { StatusBadge } from "./StatusBadge";
import { IconChevronRight, IconEdit, IconTrash } from "@/components/common/icons";
import type { LeadDTO } from "@/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function LeadTable({
  leads,
  isLoading,
  canManage,
  onRowClick,
  onEdit,
  onDelete,
}: {
  leads: LeadDTO[];
  isLoading: boolean;
  canManage: boolean;
  onRowClick: (lead: LeadDTO) => void;
  onEdit: (lead: LeadDTO) => void;
  onDelete: (lead: LeadDTO) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={24} />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <EmptyState title="No leads found" description="Try adjusting your filters, or create a new lead." />
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell className="hidden md:table-cell">Company</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="hidden lg:table-cell">Assigned to</TableHeaderCell>
          <TableHeaderCell className="hidden sm:table-cell">Created</TableHeaderCell>
          {canManage && <TableHeaderCell className="text-right">Actions</TableHeaderCell>}
          <TableHeaderCell className="w-8" aria-hidden="true" />
        </TableRow>
      </TableHead>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id} className="group cursor-pointer" onClick={() => onRowClick(lead)}>
            <TableCell>
              <p className="font-medium text-ink group-hover:text-accent group-hover:underline">{lead.name}</p>
              <p className="text-xs text-ink-soft">{lead.email}</p>
            </TableCell>
            <TableCell className="hidden md:table-cell">{lead.company}</TableCell>
            <TableCell>
              <StatusBadge status={lead.status} />
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {lead.assignedUser ? (
                lead.assignedUser.name
              ) : (
                <span className="text-ink-faint">Unassigned</span>
              )}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-ink-soft">{formatDate(lead.createdAt)}</TableCell>
            {canManage && (
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 text-ink-faint hover:bg-accent-soft hover:text-accent"
                    onClick={() => onEdit(lead)}
                    aria-label={`Edit ${lead.name}`}
                    title={`Edit ${lead.name}`}
                  >
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 text-ink-faint hover:bg-danger-soft hover:text-danger"
                    onClick={() => onDelete(lead)}
                    aria-label={`Delete ${lead.name}`}
                    title={`Delete ${lead.name}`}
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              </TableCell>
            )}
            <TableCell className="pl-0 text-ink-faint">
              <IconChevronRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:text-ink-soft"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
