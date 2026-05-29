import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

export const Route = createFileRoute("/_dev/templates/$slug")({
  component: TemplatePreviewPage,
  head: ({ params }) => ({
    meta: [{ title: `Brand-It — Template Preview: ${params.slug}` }],
  }),
});

/**
 * Renders a template at full canvas size against its defaultBrandVars.
 * Used during development and by the CI smoke render check.
 */
function TemplatePreviewPage() {
  const { slug } = Route.useParams();

  return (
    <div className="min-h-screen bg-cf-bg-page py-12 flex flex-col items-center">
      <div className="mb-8 text-center space-y-1">
        <h3>Template Preview</h3>
        <p className="font-mono text-sm text-cf-text-muted">{slug}</p>
        <p className="text-xs text-cf-text-subtle">
          Rendered with <code>defaultBrandVars</code> — Week 1 visual baseline.
        </p>
      </div>

      {/* Bordered container with corner brackets */}
      <div className="relative border border-cf-border rounded-card shadow-card overflow-hidden">
        <span
          className="absolute -top-1 -left-1 h-2 w-2 rounded-[1.5px] border border-cf-border bg-cf-bg-page z-10"
          aria-hidden="true"
        />
        <span
          className="absolute -top-1 -right-1 h-2 w-2 rounded-[1.5px] border border-cf-border bg-cf-bg-page z-10"
          aria-hidden="true"
        />
        <span
          className="absolute -bottom-1 -left-1 h-2 w-2 rounded-[1.5px] border border-cf-border bg-cf-bg-page z-10"
          aria-hidden="true"
        />
        <span
          className="absolute -bottom-1 -right-1 h-2 w-2 rounded-[1.5px] border border-cf-border bg-cf-bg-page z-10"
          aria-hidden="true"
        />

        <Suspense
          fallback={
            <div className="p-12 text-center text-cf-text-muted text-sm">Loading template…</div>
          }
        >
          <TemplateRenderer slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Registry of lazy-loaded template renderers.
 * Add an entry here whenever a new template folder is created.
 * Vite resolves the dynamic import at build time from the string literal.
 */
const TEMPLATE_REGISTRY: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "cf-one-partner-brief": lazy(async () => {
    const { default: Template, defaultBrandVars } = await import(
      /* @vite-ignore */
      "../../../templates/cf-one-partner-brief/Template.tsx"
    );
    return {
      default: () => <Template vars={defaultBrandVars} />,
    };
  }),
};

function TemplateRenderer({ slug }: { slug: string }) {
  const LazyTemplate = TEMPLATE_REGISTRY[slug];

  if (!LazyTemplate) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-cf-text-muted">
          Template not found: <code className="font-mono">{slug}</code>
        </p>
        <p className="text-sm text-cf-text-subtle">
          Create <code className="font-mono">templates/{slug}/</code> and run{" "}
          <code className="font-mono">pnpm templates:compile</code>.
        </p>
      </div>
    );
  }

  return <LazyTemplate />;
}
