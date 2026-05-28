import type { ComponentPropsWithoutRef } from "react";

interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, hint, id, options, className = "", ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-cf-text leading-none">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={[
            "w-full appearance-none bg-cf-bg-200 border border-cf-border rounded-input",
            "px-3 py-2.5 pr-8 text-sm text-cf-text",
            "transition-[border-color,box-shadow] duration-fast",
            "focus:outline-none focus:border-cf-orange focus:shadow-focus",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            error && "border-cf-error",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron well */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 bg-cf-bg-300 rounded-r-input border-l border-cf-border">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-cf-error">{error}</p>}
      {hint && !error && <p className="text-xs text-cf-text-subtle">{hint}</p>}
    </div>
  );
}
