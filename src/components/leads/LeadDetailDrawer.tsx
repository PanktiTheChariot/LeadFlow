"use client";

import { useEffect, useState } from "react";
import { Button, Drawer, Field, Select, Spinner } from "@/components/common";
import { StatusBadge } from "./StatusBadge";
import { LeadNotesPanel } from "./LeadNotesPanel";
import { IconBriefcase, IconMail, IconPhone } from "@/components/common/icons";
import { apiFetch } from "@/lib/apiClient";
import { useUiStore } from "@/store/uiStore";
import { LEAD_STATUSES } from "@/types";
import type { LeadDTO, LeadStatus, UserRole } from "@/types";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function LeadDetailDrawer({
  isOpen,
  onClose,
  leadId,
  role,
  onUpdated,
  onEditFull,
  canManage,
}: {
  isOpen: boolean;
  onClose: () => void;
  leadId: string | null;
  role: UserRole;
  onUpdated: () => void;
  onEditFull: (lead: LeadDTO) => void;
  canManage: boolean;
}) {
  const pushToast = useUiStore((state) => state.pushToast);
  const [lead, setLead] = useState<LeadDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<LeadStatus>("New");
  const [isSaving, setIsSaving] = useState(false);

  const [trackedLeadId, setTrackedLeadId] = useState(leadId);
  if (trackedLeadId !== leadId) {
    setTrackedLeadId(leadId);
    if (isOpen && leadId) setIsLoading(true);
  }

  useEffect(() => {
    if (!isOpen || !leadId) return;
    apiFetch<{ lead: LeadDTO }>(`/api/leads/${leadId}`).then((result) => {
      setIsLoading(false);
      if (!result.ok) {
        pushToast(result.error, "error");
        onClose();
        return;
      }
      setLead(result.data.lead);
      setStatus(result.data.lead.status);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, leadId]);

  function handleLeadChange(updated: LeadDTO) {
    setLead(updated);
    setStatus(updated.status);
    onUpdated();
  }

  async function handleSaveStatus() {
    if (!lead) return;
    setIsSaving(true);
    const result = await apiFetch<{ lead: LeadDTO }>(`/api/leads/${lead.id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    setIsSaving(false);

    if (!result.ok) {
      pushToast(result.error, "error");
      return;
    }
    pushToast("Lead updated", "success");
    handleLeadChange(result.data.lead);
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        lead ? (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron text-sm font-semibold text-white">
              {getInitials(lead.name)}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2">
                {lead.name}
                <StatusBadge status={lead.status} />
              </span>
              <span className="text-xs font-normal text-ink-faint">{lead.company}</span>
            </span>
          </>
        ) : (
          "Lead"
        )
      }
      footer={
        lead && (
          <div className="flex justify-end">
            <Button onClick={handleSaveStatus} isLoading={isSaving} disabled={status === lead.status}>
              Save changes
            </Button>
          </div>
        )
      }
    >
      {isLoading || !lead ? (
        <div className="flex justify-center py-16">
          <Spinner size={24} />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-paper p-4">
            <div className="flex items-center gap-2.5 text-sm text-ink">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface text-ink-soft">
                <IconMail size={14} strokeWidth={1.9} />
              </span>
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-ink">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface text-ink-soft">
                <IconPhone size={14} strokeWidth={1.9} />
              </span>
              <span>{lead.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-ink">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface text-ink-soft">
                <IconBriefcase size={14} strokeWidth={1.9} />
              </span>
              <span>{lead.company}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md bg-paper px-3 py-2 text-xs text-ink-soft">
            <span>Assigned to {lead.assignedUser ? lead.assignedUser.name : "nobody"}</span>
            {canManage && (
              <Button variant="ghost" size="sm" onClick={() => onEditFull(lead)}>
                Edit details
              </Button>
            )}
          </div>

          <Field label="Status" htmlFor="drawer-status">
            <Select
              id="drawer-status"
              value={status}
              onValueChange={(v) => setStatus(v as LeadStatus)}
              options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </Field>

          <LeadNotesPanel lead={lead} role={role} onLeadChange={handleLeadChange} />
        </div>
      )}
    </Drawer>
  );
}
