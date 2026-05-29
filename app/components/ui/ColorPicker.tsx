import { useCallback, useRef, useState } from "react";
import { Card } from "./Card";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleHexChange = useCallback(
    (raw: string) => {
      const hex = raw.startsWith("#") ? raw : `#${raw}`;
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        onChange(hex);
      }
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-cf-text">{label}</span>}
      <div className="flex items-center gap-3">
        {/* Swatch */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="relative flex-shrink-0 h-16 w-16 rounded-card border border-cf-border shadow-card hover:border-dashed transition-[border-style] duration-fast focus-visible:outline-none focus-visible:shadow-focus"
          style={{ backgroundColor: value }}
          aria-label={`Pick colour, current: ${value}`}
        >
          {/* Corner brackets on the swatch */}
          <span
            className="absolute -top-1 -left-1 h-2 w-2 rounded-[1.5px] border border-cf-border bg-cf-bg-page"
            aria-hidden="true"
          />
          <span
            className="absolute -top-1 -right-1 h-2 w-2 rounded-[1.5px] border border-cf-border bg-cf-bg-page"
            aria-hidden="true"
          />
          <span
            className="absolute -bottom-1 -left-1 h-2 w-2 rounded-[1.5px] border border-cf-border bg-cf-bg-page"
            aria-hidden="true"
          />
          <span
            className="absolute -bottom-1 -right-1 h-2 w-2 rounded-[1.5px] border border-cf-border bg-cf-bg-page"
            aria-hidden="true"
          />
        </button>
        {/* Hex input */}
        <input
          type="text"
          value={value}
          onChange={(e) => handleHexChange(e.target.value)}
          maxLength={7}
          className="w-28 bg-cf-bg-200 border border-cf-border rounded-input px-3 py-2 font-mono text-sm text-cf-text focus:outline-none focus:border-cf-orange focus:shadow-focus transition-[border-color,box-shadow] duration-fast"
        />
      </div>

      {/* Native colour input popover */}
      {open && (
        <Card padding="sm" className="absolute z-50 mt-1">
          <input
            ref={inputRef}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-32 w-48 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </Card>
      )}
    </div>
  );
}
