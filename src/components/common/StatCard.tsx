import { Card } from "./Card";
import { IconArrowDown, IconArrowUp, type IconComponent } from "./icons";

export type StatTone = "total" | "new" | "qualified" | "converted" | "lost";

/**
 * Every card shares the same white surface and neutral badge circle. The
 * per-status cards reuse the exact same tokens as StatusBadge (the pill
 * shown in the leads table), so "New" is the same blue everywhere in the
 * app instead of an unrelated color on the dashboard. Total is the only
 * non-status aggregate, so it stays neutral ink rather than borrowing a
 * status hue it doesn't represent.
 */
const TONE_CONFIG: Record<StatTone, { tick: string; icon: string }> = {
  total: { tick: "--color-accent", icon: "--color-accent" },
  new: { tick: "--color-status-new", icon: "--color-status-new" },
  qualified: { tick: "--color-status-qualified", icon: "--color-status-qualified" },
  converted: { tick: "--color-status-converted", icon: "--color-status-converted" },
  lost: { tick: "--color-status-lost", icon: "--color-status-lost" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  delta,
}: {
  label: string;
  value: number | string;
  icon: IconComponent;
  tone: StatTone;
  /** Percentage change vs. the prior period, e.g. 12 or -4. Omit when there's no meaningful comparison. */
  delta?: number;
}) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const isPositive = hasDelta && delta! > 0;
  const isFlat = hasDelta && delta === 0;
  const { tick, icon } = TONE_CONFIG[tone];

  return (
    <Card className="relative overflow-hidden p-4">
      <span className="absolute top-5 left-0 h-3.5 w-1 rounded-full" style={{ backgroundColor: `var(${tick})` }} />

      <div className="pl-2.5">
        <p className="text-sm font-medium text-ink-soft">{label}</p>

        <div className="mt-3 flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-badge-neutral"
            style={{ color: `var(${icon})` }}
          >
            <Icon size={16} strokeWidth={2} />
          </span>
          <p className="font-heading text-2xl leading-none text-ink">{value}</p>
        </div>

        {hasDelta && (
          <p
            className={`mt-3 flex items-center gap-1 text-xs font-medium ${
              isFlat ? "text-ink-faint" : isPositive ? "text-success" : "text-danger"
            }`}
          >
            {!isFlat && (isPositive ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />)}
            {isFlat ? "No change" : `${isPositive ? "+" : ""}${delta}%`}
            <span className="font-normal text-ink-faint">vs. last week</span>
          </p>
        )}
      </div>
    </Card>
  );
}
