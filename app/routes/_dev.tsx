import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Dev layout — only accessible in development / preview.
 * No auth guard. Thin wrapper with a top banner.
 */
export const Route = createFileRoute("/_dev")({
  component: DevLayout,
});

function DevLayout() {
  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center gap-3 px-6 py-2 bg-cf-text text-cf-bg-100 text-xs font-mono">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-pill bg-cf-orange animate-pulse" />
          DEV PREVIEW
        </span>
        <span className="text-cf-text-subtle">|</span>
        <a href="/_dev/components" className="hover:text-white transition-colors duration-fast">
          Components
        </a>
        <a
          href="/_dev/templates/cf-one-partner-brief"
          className="hover:text-white transition-colors duration-fast"
        >
          Template: cf-one-partner-brief
        </a>
      </div>
      <Outlet />
    </div>
  );
}
