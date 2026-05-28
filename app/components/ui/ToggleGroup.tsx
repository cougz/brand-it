import type { ReactNode } from "react";

interface ToggleGroupItem {
  value: string;
  label: ReactNode;
}

interface ToggleGroupProps {
  items: ToggleGroupItem[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ToggleGroup({ items, value, onChange, label }: ToggleGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-cf-text">{label}</span>}
      <div className="inline-flex rounded-pill border border-cf-border bg-cf-bg-200 p-0.5 gap-0.5">
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={[
                "px-4 py-1.5 rounded-pill text-sm font-medium leading-none",
                "transition-colors duration-fast",
                "focus-visible:outline-none focus-visible:shadow-focus",
                selected ? "bg-cf-orange text-white" : "text-cf-text hover:bg-cf-bg-300",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
