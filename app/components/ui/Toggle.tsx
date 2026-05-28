import { motion } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";

interface ToggleProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label, disabled, ...props }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-6 w-11 flex-shrink-0 rounded-pill",
          "transition-colors duration-normal",
          "focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          checked ? "bg-cf-orange" : "bg-cf-border",
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-pill bg-white shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </button>
      {label && <span className="text-sm font-medium text-cf-text">{label}</span>}
    </label>
  );
}
