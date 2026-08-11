"use client";

import { useState } from "react";
import { Button, Field, Textarea } from "@/components/common";
import { IconBookmark, IconCopy, IconSparkles } from "@/components/common/icons";
import { apiFetch } from "@/lib/apiClient";
import { useUiStore } from "@/store/uiStore";

export function AIReplyPanel({
  leadId,
  defaultMessage,
  onSaveReply,
  isSavingReply,
}: {
  leadId: string;
  defaultMessage?: string;
  onSaveReply?: (reply: string) => void;
  isSavingReply?: boolean;
}) {
  const pushToast = useUiStore((state) => state.pushToast);
  const [message, setMessage] = useState(defaultMessage ?? "");
  const [reply, setReply] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!message.trim()) return;
    setIsGenerating(true);
    setReply("");
    const result = await apiFetch<{ reply: string }>(`/api/leads/${leadId}/ai-reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    setIsGenerating(false);

    if (!result.ok) {
      pushToast(result.error, "error");
      return;
    }
    setReply(result.data.reply);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(reply);
    pushToast("Reply copied to clipboard", "success");
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-saffron/25 bg-saffron-soft/40 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron text-white">
          <IconSparkles size={14} strokeWidth={2} />
        </span>
        <p className="font-heading text-sm text-ink">AI Generate Reply</p>
      </div>
      <Field label="Lead's message" htmlFor="ai-message">
        <Textarea
          id="ai-message"
          rows={3}
          placeholder="I'm interested in your product. Can you tell me more about pricing?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Field>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!message.trim()}
        className="self-start"
      >
        Generate reply
      </Button>

      {reply && (
        <div className="flex flex-col gap-2 rounded-lg border-l-4 border-saffron bg-surface p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-saffron uppercase">
            <IconSparkles size={11} strokeWidth={2.5} />
            Generated reply
          </p>
          <Textarea readOnly rows={6} value={reply} className="border-none bg-transparent p-0 shadow-none" />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
              <IconCopy size={14} strokeWidth={1.9} />
              Copy to clipboard
            </Button>
            {onSaveReply && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onSaveReply(reply)}
                isLoading={isSavingReply}
                className="bg-saffron hover:bg-saffron-hover"
              >
                <IconBookmark size={14} strokeWidth={1.9} />
                Save reply
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
