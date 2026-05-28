import { motion } from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary: cream bg, orange text — swaps to dashed-orange border on hover
  primary:
    "bg-cf-bg-100 text-cf-orange border border-cf-bg-100 hover:bg-transparent hover:border-dashed hover:border-cf-orange",
  // Secondary: orange bg, white text — used on orange backgrounds
  secondary:
    "bg-cf-orange text-white border border-cf-orange hover:opacity-95 hover:border-dashed hover:border-white/50",
  // Ghost: transparent, orange text, border-cf-border — dashed orange on hover
  ghost:
    "bg-transparent text-cf-orange border border-cf-border hover:border-dashed hover:border-cf-orange hover:text-cf-text",
  // Icon: no text, square pill shape
  icon: "bg-transparent text-cf-text-muted border border-cf-border hover:border-dashed hover:border-cf-border hover:text-cf-text",
};

const sizeClasses: Record<Exclude<ButtonSize, "icon">, string> = {
  sm: "py-1.5 px-4 text-sm",
  md: "py-3 px-6 text-sm",
  lg: "py-3.5 px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type="button"
      whileTap={isDisabled ? undefined : { scale: 0.98, y: 1 }}
      transition={{ duration: 0.16, ease: [0.55, 0.085, 0.68, 0.53] }}
      disabled={isDisabled}
      className={[
        // Base: always pill, font weight, tracking, transition
        "inline-flex items-center justify-center gap-2 rounded-pill font-medium",
        "leading-none whitespace-nowrap select-none",
        "transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:shadow-focus",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses[variant],
        size === "icon" ? "p-2" : sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...(props as Record<string, unknown>)}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 rounded-pill border-2 border-current border-t-transparent animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
