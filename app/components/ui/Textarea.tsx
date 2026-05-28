import type { ComponentPropsWithoutRef } from "react";

interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
}

export function Textarea({
  label,
  error,
  hint,
  id,
  maxLength,
  value,
  className = "",
  ...props
}: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const charCount = typeof value === "string" ? value.length : 0;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-cf-text leading-none">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={inputId}
          maxLength={maxLength}
          value={value}
          rows={4}
          className={[
            "w-full bg-cf-bg-200 border border-cf-border rounded-input",
            "px-3 py-2.5 text-sm text-cf-text placeholder:text-cf-text-subtle",
            "resize-y transition-[border-color,box-shadow] duration-fast",
            "focus:outline-none focus:border-cf-orange focus:shadow-focus",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            maxLength && "pb-6",
            error && "border-cf-error",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {maxLength && (
          <span className="absolute bottom-2 right-3 font-mono text-xs text-cf-text-subtle select-none pointer-events-none">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-cf-error">{error}</p>}
      {hint && !error && <p className="text-xs text-cf-text-subtle">{hint}</p>}
    </div>
  );
}
