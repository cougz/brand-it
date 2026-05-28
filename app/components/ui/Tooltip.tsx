import { type ReactNode, useState } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

const sideClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: tooltip wrapper needs mouse events
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={[
            "absolute z-50 px-2.5 py-1.5 whitespace-nowrap",
            "bg-cf-text text-cf-bg-100 text-xs font-medium rounded-input",
            "pointer-events-none select-none",
            sideClasses[side],
          ].join(" ")}
        >
          {content}
        </span>
      )}
    </span>
  );
}
