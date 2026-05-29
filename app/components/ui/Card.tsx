import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  /** Show hover state (dashed border). Use for interactive/clickable cards. */
  interactive?: boolean;
  /** Remove the auto-injected corner brackets. Default: false. */
  noBrackets?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  /**
   * Background colour the card sits on — used to fill the corner bracket
   * squares so they blend with the surface behind the card.
   * Defaults to var(--cf-bg-page) (the outermost page background).
   * Pass var(--cf-bg-100) when this card is nested inside another card body.
   */
  bracketBg?: string;
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
  bracketBg = "var(--cf-bg-page)",
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
      {!noBrackets && <CornerBrackets bg={bracketBg} />}
      {children}
    </div>
  );
}

/** Four 8×8 px corner-bracket squares positioned at -4px from each card corner. */
function CornerBrackets({ bg }: { bg: string }) {
  const style: React.CSSProperties = {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 1.5,
    border: "1px solid var(--cf-border)",
    background: bg,
    pointerEvents: "none",
    zIndex: 1,
  };

  return (
    <>
      <span aria-hidden="true" style={{ ...style, top: -4, left: -4 }} />
      <span aria-hidden="true" style={{ ...style, top: -4, right: -4 }} />
      <span aria-hidden="true" style={{ ...style, bottom: -4, left: -4 }} />
      <span aria-hidden="true" style={{ ...style, bottom: -4, right: -4 }} />
    </>
  );
}
