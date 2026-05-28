import { createContext, type ReactNode, useContext, useState } from "react";

/* ── Context ──────────────────────────────────────────────── */
interface TabsContextValue {
  active: string;
  setActive: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs compound components must be used inside <Tabs>");
  return ctx;
}

/* ── Root ─────────────────────────────────────────────────── */
interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className = "" }: TabsProps) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

/* ── List ─────────────────────────────────────────────────── */
interface TabsListProps {
  children: ReactNode;
  className?: string;
}

Tabs.List = function TabsList({ children, className = "" }: TabsListProps) {
  return (
    <div role="tablist" className={`flex border-b border-cf-border ${className}`}>
      {children}
    </div>
  );
};

/* ── Trigger ──────────────────────────────────────────────── */
interface TabsTriggerProps {
  value: string;
  children: ReactNode;
}

Tabs.Trigger = function TabsTrigger({ value, children }: TabsTriggerProps) {
  const { active, setActive } = useTabsContext();
  const isActive = active === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={[
        "px-4 py-2.5 text-sm font-medium leading-none relative",
        "transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:shadow-focus",
        isActive
          ? "text-cf-orange after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-cf-orange"
          : "text-cf-text-muted hover:text-cf-text",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
};

/* ── Content ──────────────────────────────────────────────── */
interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

Tabs.Content = function TabsContent({ value, children, className = "" }: TabsContentProps) {
  const { active } = useTabsContext();
  if (active !== value) return null;
  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
};
