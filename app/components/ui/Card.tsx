import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  /** Show hover state (dashed border). Use for interactive/clickable cards. */
  interactive?: boolean;
  /** Remove the auto-injected corner brackets. Default: false. */
  noBrackets?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/**
 * Card with the CF Workers aesthetic:
 * - Warm bg, border, card radius, shadow
 * - Four corner brackets at the outer corners (auto-injected unless noBrackets)
 * - Dashed border on hover when `interactive`
 */
export function Card({
  children,
  interactive = false,
  noBrackets = false,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "relative bg-cf-bg-200 border border-cf-border rounded-card shadow-card",
        "transition-[border-style] duration-fast",
        interactive && "cursor-pointer hover:border-dashed",
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {!noBrackets && <CornerBrackets />}
      {children}
    </div>
  );
}

/**
 * Four 8×8 px rounded squares at the outer corners of the card.
 * Each is positioned absolute with -4px offset from each corner edge.
 */
function CornerBrackets() {
  return (
    <>
      {/* top-left */}
      <span className="bracket bracket-tl" aria-hidden="true" />
      {/* top-right */}
      <span className="bracket bracket-tr" aria-hidden="true" />
      {/* bottom-left */}
      <span className="bracket bracket-bl" aria-hidden="true" />
      {/* bottom-right */}
      <span className="bracket bracket-br" aria-hidden="true" />

      <style>{`
        .bracket {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 1.5px;
          border: 1px solid var(--cf-border);
          background: var(--cf-bg-100);
          pointer-events: none;
          z-index: 1;
        }
        .bracket-tl { top: -4px; left: -4px; }
        .bracket-tr { top: -4px; right: -4px; }
        .bracket-bl { bottom: -4px; left: -4px; }
        .bracket-br { bottom: -4px; right: -4px; }
      `}</style>
    </>
  );
}
