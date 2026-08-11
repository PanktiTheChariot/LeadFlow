"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IconClose } from "./icons";

export function Drawer({
  isOpen,
  onClose,
  title,
  size = "md",
  footer,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  size?: "md" | "lg";
  footer?: ReactNode;
  children: ReactNode;
}) {
  const widthClass = size === "lg" ? "max-w-xl" : "max-w-md";

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Dialog.Content
          className={`fixed inset-y-0 right-0 z-50 flex h-full w-full ${widthClass} flex-col border-l border-border bg-surface shadow-xl focus:outline-none`}
        >
          <div className="shrink-0 flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="flex items-center gap-3 font-heading text-lg text-ink">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="rounded-md p-1 text-ink-soft hover:bg-black/5 hover:text-ink"
              >
                <IconClose size={18} />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="shrink-0 border-t border-border px-5 py-4">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
