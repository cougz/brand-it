import type { ComponentPropsWithoutRef } from "react";

interface SliderProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "onChange"> {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  showValue?: boolean;
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  showValue = true,
  id,
  ...props
}: SliderProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-cf-text">
            {label}
          </label>
        )}
        {showValue && <span className="font-mono text-xs text-cf-text-muted">{value}</span>}
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--cf-orange) ${pct}%, var(--cf-border) ${pct}%)`,
        }}
        className="w-full h-1.5 rounded-pill appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:rounded-pill
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-cf-orange
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-grab
          [&::-webkit-slider-thumb:active]:cursor-grabbing
          focus:outline-none focus-visible:shadow-focus"
        {...props}
      />
    </div>
  );
}
