"use client";

import { useState } from "react";
import { Button, Field, Modal, Textarea } from "@/components/common";
import { AIReplyPanel } from "./AIReplyPanel";
import { IconNotes, IconTrash } from "@/components/common/icons";
import { apiFetch } from "@/lib/apiClient";
import { useUiStore } from "@/store/uiStore";
import type { LeadDTO, UserRole } from "@/types";

function formatReplyTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Notes + saved AI replies for a lead, kept as one self-contained unit so it
 * can be dropped into the full lead detail drawer AND opened on its own via
 * the table's dedicated "Notes" action - without duplicating the fetch/save
 * logic between the two entry points. Saving notes here is independent of
 * saving the lead's status; each has its own explicit save action. Saved
 * replies live in their own modal rather than an inline list - with several
 * saved, an inline list would compete for scroll space with Notes and the
 * AI panel in the same view.
 */
export function LeadNotesPanel({
  lead,
  role,
  onLeadChange,
}: {
  lead: LeadDTO;
  role: UserRole;
  onLeadChange: (lead: LeadDTO) => void;
}) {
  const pushToast = useUiStore((state) => state.pushToast);
  const [notes, setNotes] = useState(lead.notes);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [isRepliesModalOpen, setIsRepliesModalOpen] = useState(false);

  const [trackedLeadId, setTrackedLeadId] = useState(lead.id);
  if (trackedLeadId !== lead.id) {
    setTrackedLeadId(lead.id);
    setNotes(lead.notes);
  }

  async function handleSaveNotes() {
    setIsSavingNotes(true);
    const result = await apiFetch<{ lead: LeadDTO }>(`/api/leads/${lead.id}`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
    setIsSavingNotes(false);

    if (!result.ok) {
      pushToast(result.error, "error");
      return;
    }
    pushToast("Notes saved", "success");
    onLeadChange(result.data.lead);
  }

  async function handleSaveReply(reply: string) {
    setIsSavingReply(true);
    const result = await apiFetch<{ lead: LeadDTO }>(`/api/leads/${lead.id}/replies`, {
      method: "POST",
      body: JSON.stringify({ text: reply }),
    });
    setIsSavingReply(false);

    if (!result.ok) {
      pushToast(result.error, "error");
      return;
    }
    pushToast("Reply saved", "success");
    onLeadChange(result.data.lead);
    setIsRepliesModalOpen(true);
  }

  async function handleDeleteReply(replyId: string) {
    const result = await apiFetch<{ lead: LeadDTO }>(`/api/leads/${lead.id}/replies/${replyId}`, {
      method: "DELETE",
    });

    if (!result.ok) {
      pushToast(result.error, "error");
      return;
    }
    pushToast("Saved reply removed", "success");
    onLeadChange(result.data.lead);
  }

  return (
    <div className="flex flex-col gap-5">
      <Field label="Notes" htmlFor="lead-notes">
        <Textarea id="lead-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleSaveNotes}
          isLoading={isSavingNotes}
          disabled={notes === lead.notes}
        >
          Save notes
        </Button>
        {lead.savedReplies.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsRepliesModalOpen(true)}>
            <IconNotes size={14} strokeWidth={1.9} />
            View saved replies ({lead.savedReplies.length})
          </Button>
        )}
      </div>

      <AIReplyPanel
        leadId={lead.id}
        defaultMessage={role === "user" ? notes : undefined}
        onSaveReply={handleSaveReply}
        isSavingReply={isSavingReply}
      />

      <Modal
        isOpen={isRepliesModalOpen}
        onClose={() => setIsRepliesModalOpen(false)}
        title={`Saved replies (${lead.savedReplies.length})`}
      >
        {lead.savedReplies.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-faint">No saved replies yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {lead.savedReplies.map((saved) => (
              <div key={saved.id} className="rounded-lg border border-border bg-paper p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs text-ink-faint">{formatReplyTimestamp(saved.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteReply(saved.id)}
                    aria-label="Remove saved reply"
                    title="Remove saved reply"
                    className="rounded p-1 text-ink-faint hover:bg-danger-soft hover:text-danger"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap text-ink">{saved.text}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
