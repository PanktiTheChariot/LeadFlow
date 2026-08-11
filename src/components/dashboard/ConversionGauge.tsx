const SIZE = 128;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ConversionGauge({ converted, total }: { converted: number; total: number }) {
  const percent = total > 0 ? Math.round((converted / total) * 100) : 0;
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-paper)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-status-converted-pastel)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading text-2xl text-ink">{percent}%</span>
        </div>
      </div>
      <p className="text-center text-xs text-ink-soft">
        {converted} of {total} leads converted
      </p>
    </div>
  );
}
