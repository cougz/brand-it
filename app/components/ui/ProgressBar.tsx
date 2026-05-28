interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({ value, label, showValue = false, size = "md" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="flex flex-col gap-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-cf-text">{label}</span>}
          {showValue && <span className="font-mono text-xs text-cf-text-muted">{clamped}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-cf-border rounded-pill overflow-hidden ${size === "sm" ? "h-1" : "h-1.5"}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-cf-orange rounded-pill transition-[width] duration-slow ease-[var(--ease-entrance)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
