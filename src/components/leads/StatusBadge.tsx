import clsx from "clsx";
import type { LeadStatus } from "@/types";

const STATUS_CLASSES: Record<LeadStatus, string> = {
  New: "bg-status-new-soft text-status-new",
  Contacted: "bg-status-contacted-soft text-status-contacted",
  Qualified: "bg-status-qualified-soft text-status-qualified",
  Converted: "bg-status-converted-soft text-status-converted",
  Lost: "bg-status-lost-soft text-status-lost",
};

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
