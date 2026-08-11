"use client";

import clsx from "clsx";
import { useUiStore } from "@/store/uiStore";
import type { ToastVariant } from "@/store/uiStore";

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  info: "border-border-strong bg-surface text-ink",
  success: "border-success bg-success-soft text-success",
  error: "border-danger bg-danger-soft text-danger",
};

export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={clsx(
            "flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm shadow-md",
            VARIANT_CLASSES[toast.variant],
          )}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss"
            className="text-inherit opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
