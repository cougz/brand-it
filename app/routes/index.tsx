import { Link, createFileRoute } from "@tanstack/react-router";
import { Card } from "~/components/ui/Card";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({ meta: [{ title: "Brand-It — Week 1 Status" }] }),
});

const weeks = [
  {
    n: 1,
    label: "Scaffold + Design System",
    done: true,
    items: [
      "TanStack Start + Vite + Tailwind v4 + Biome",
      "CF Workers design tokens (colours, type, spacing, motion)",
      "12 UI components (Button, Card, Input, Tabs…)",
      "Template compiler: content.md → TypeScript + Zod",
      "First template: cf-one-partner-brief (A4 PDF one-pager)",
      "Workers Builds CI/CD wired via GitHub",
    ],
  },
  {
    n: 2,
    label: "Auth + Brand Kit + Editor",
    done: false,
    items: [
      "D1 migrations",
      "Cloudflare Access (OTP email) auth",
      "Partner context middleware",
      "Brand kit CRUD + direct-to-R2 logo upload",
      "Asset library page",
      "Form-driven editor with live preview",
    ],
  },
  {
    n: 3,
    label: "AI Chat + Tone Rewrite",
    done: false,
    items: [
      "PartnerSession + EditorSession Durable Objects",
      "AI chat tab (Workers AI streaming)",
      "Per-field tone rewrite sparkle",
      "Glossary enforcement",
    ],
  },
  {
    n: 4,
    label: "PDF / PNG Export",
    done: false,
    items: [
      "Export Worker + Container + Browser Rendering",
      "Cloudflare Queues pipeline",
      "R2 etag cache",
      "SSE progress feedback",
    ],
  },
  {
    n: 5,
    label: "Translation + More Templates",
    done: false,
    items: [
      "One-click EN → DE / FR / ES translation",
      "Two additional templates",
      "Visual regression tests",
      "Observability events",
    ],
  },
  {
    n: 6,
    label: "Polish + Pilot Launch",
    done: false,
    items: [
      "Motion, microcopy, empty states, error states",
      "Accessibility audit",
      "Pilot partner onboarding (3 partners)",
    ],
  },
];

function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-16 space-y-12">
      {/* Hero */}
      <div className="space-y-3">
        <p
          className="font-mono text-xs uppercase tracking-widest text-cf-orange"
        >
          Week 1 of 6 · In development
        </p>
        <h1>Brand-It</h1>
        <p className="text-cf-text-muted max-w-xl" style={{ fontSize: "1.125rem" }}>
          Self-service co-branded marketing assets for Cloudflare channel
          partners. Partners pick a template, fill their brand kit, and
          export a polished PDF — no designer required.
        </p>
      </div>

      {/* Live now */}
      <section className="space-y-4">
        <h3>What's live now</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link to="/components" className="block">
            <Card interactive padding="md" className="h-full">
              <div className="flex flex-col gap-2">
                <p className="font-medium text-cf-text">Component Gallery</p>
                <p className="text-sm text-cf-text-muted">
                  Every UI primitive in every state. The visual baseline
                  for the CF Workers design system.
                </p>
                <p className="font-mono text-xs text-cf-orange mt-auto pt-2">
                  /components →
                </p>
              </div>
            </Card>
          </Link>
          <Link to="/templates/$slug" params={{ slug: "cf-one-partner-brief" }} className="block">
            <Card interactive padding="md" className="h-full">
              <div className="flex flex-col gap-2">
                <p className="font-medium text-cf-text">First Template Preview</p>
                <p className="text-sm text-cf-text-muted">
                  Cloudflare One Partner Brief — A4 portrait one-pager
                  rendered with default brand values.
                </p>
                <p className="font-mono text-xs text-cf-orange mt-auto pt-2">
                  /templates/cf-one-partner-brief →
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Roadmap */}
      <section className="space-y-4">
        <h3>Six-week build plan</h3>
        <div className="space-y-3">
          {weeks.map((w) => (
            <div
              key={w.n}
              className={[
                "flex gap-4 rounded-card border p-5",
                w.done
                  ? "border-cf-border bg-cf-bg-200"
                  : "border-cf-border-light bg-cf-bg-page opacity-60",
              ].join(" ")}
            >
              {/* Week badge */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
                <span
                  className={[
                    "font-mono text-xs rounded-pill px-2 py-0.5",
                    w.done
                      ? "bg-cf-orange text-white"
                      : "bg-cf-border text-cf-text-muted",
                  ].join(" ")}
                >
                  W{w.n}
                </span>
                {w.done && (
                  <span className="font-mono text-xs text-cf-success">✓</span>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="font-medium text-cf-text text-sm">{w.label}</p>
                <ul className="space-y-0.5">
                  {w.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-cf-text-muted flex items-start gap-1.5"
                    >
                      <span className="mt-0.5 text-cf-border">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stack note */}
      <section
        className="rounded-card border border-cf-border bg-cf-bg-200 p-6 space-y-2"
      >
        <p className="font-medium text-cf-text text-sm">Tech stack</p>
        <p className="text-sm text-cf-text-muted">
          TanStack Start (SSR) · Hono · Tailwind v4 · Biome · D1 · R2 · KV · Workers AI ·
          Agents SDK (DOs) · Cloudflare Queues · Browser Rendering · Cloudflare Access
        </p>
        <p className="font-mono text-xs text-cf-text-subtle">
          100% Cloudflare Developer Platform · No third-party runtime dependencies
        </p>
      </section>
    </div>
  );
}
