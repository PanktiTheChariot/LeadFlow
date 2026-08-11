import type { ReactNode } from "react";
import clsx from "clsx";

type BadgeTone = "neutral" | "accent" | "success" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-status-new-soft text-status-new",
  accent: "bg-accent-soft text-accent-hover",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
