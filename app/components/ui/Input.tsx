import type { ComponentPropsWithoutRef } from "react";

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-cf-text leading-none">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "w-full bg-cf-bg-200 border border-cf-border rounded-input",
          "px-3 py-2.5 text-sm text-cf-text placeholder:text-cf-text-subtle",
          "transition-[border-color,box-shadow] duration-fast",
          "focus:outline-none focus:border-cf-orange focus:shadow-focus",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          error && "border-cf-error",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-cf-error">{error}</p>}
      {hint && !error && <p className="text-xs text-cf-text-subtle">{hint}</p>}
    </div>
  );
}
