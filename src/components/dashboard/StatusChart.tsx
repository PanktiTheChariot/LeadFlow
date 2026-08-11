import { LEAD_STATUSES } from "@/types";
import type { LeadStatus } from "@/types";

const CHART_VAR: Record<LeadStatus, string> = {
  New: "var(--color-status-new-pastel)",
  Contacted: "var(--color-status-contacted-pastel)",
  Qualified: "var(--color-status-qualified-pastel)",
  Converted: "var(--color-status-converted-pastel)",
  Lost: "var(--color-status-lost-pastel)",
};

export function StatusChart({ byStatus }: { byStatus: Record<LeadStatus, number> }) {
  const max = Math.max(1, ...LEAD_STATUSES.map((status) => byStatus[status]));

  return (
    <div className="flex flex-col gap-3">
      {LEAD_STATUSES.map((status) => {
        const count = byStatus[status];
        const widthPercent = Math.round((count / max) * 100);
        return (
          <div key={status} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3">
            <span className="text-sm text-ink-soft">{status}</span>
            <div className="h-2.5 rounded-full bg-paper">
              <div
                className="h-2.5 rounded-full transition-[width]"
                style={{
                  width: `${Math.max(widthPercent, count > 0 ? 4 : 0)}%`,
                  backgroundColor: CHART_VAR[status],
                }}
              />
            </div>
            <span className="text-right text-sm font-medium text-ink tabular-nums">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
