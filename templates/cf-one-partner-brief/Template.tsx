/**
 * Cloudflare One Partner Brief — Template.tsx
 *
 * A4 portrait co-branded one-pager.
 * Design layer — do not edit copy here; edit content.md instead.
 *
 * data-var contract: every user-editable element carries data-var="<key>"
 * matching a key declared in content.md brandVars.
 */

import type { BrandVars } from "./brand-vars";

export { defaultBrandVars } from "./brand-vars";

// Cloudflare wordmark SVG (inline — no external asset dependency)
function CloudflareWordmark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 24" fill="none" aria-label="Cloudflare">
      <text
        x="0"
        y="20"
        fontFamily="inherit"
        fontSize="20"
        fontWeight="500"
        letterSpacing="-0.03em"
        fill="var(--cf-orange)"
      >
        Cloudflare
      </text>
    </svg>
  );
}

export default function Template({ vars }: { vars: BrandVars }) {
  return (
    <article
      className="a4-portrait flex flex-col bg-cf-bg-100 overflow-hidden"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* ── Header strip ──────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-16 py-8"
        style={{ borderBottom: "1px solid var(--cf-border)" }}
      >
        {/* Partner logo placeholder */}
        <div className="flex items-center gap-4">
          {vars.partnerLogo ? (
            <img
              data-var="partnerLogo"
              src={vars.partnerLogo}
              alt={`${vars.partnerName} logo`}
              className="h-10 max-w-[160px] object-contain"
            />
          ) : (
            <div
              data-var="partnerLogo"
              role="img"
              className="h-10 w-36 rounded-input flex items-center justify-center"
              style={{ background: vars.partnerColor ?? "var(--cf-border)", opacity: 0.3 }}
              aria-label="Partner logo placeholder"
            />
          )}

          {/* Separator */}
          <div className="h-8 w-px" style={{ background: "var(--cf-border)" }} aria-hidden="true" />

          {/* Cloudflare logo */}
          <CloudflareWordmark className="h-5 w-auto" />
        </div>

        {/* One-pager badge */}
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--cf-text-subtle)", letterSpacing: "0.05em" }}
        >
          Partner Brief
        </span>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="px-16 pt-14 pb-10" style={{ borderBottom: "1px solid var(--cf-border)" }}>
        {/* Partner colour accent bar */}
        <div
          className="h-1 w-16 rounded-pill mb-8"
          style={{ background: vars.partnerColor ?? "var(--cf-orange)" }}
          aria-hidden="true"
        />

        <h1
          data-var="headline"
          className="mb-5"
          style={{
            fontSize: "2.25rem",
            fontWeight: 500,
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            color: "var(--cf-text)",
          }}
        >
          {vars.headline}
        </h1>

        <p
          data-var="subheadline"
          style={{
            fontSize: "1.125rem",
            color: "var(--cf-text-muted)",
            letterSpacing: "-0.02em",
            lineHeight: 1.5,
            maxWidth: "520px",
          }}
        >
          {vars.subheadline}
        </p>
      </div>

      {/* ── Body + Callout ─────────────────────────────────────── */}
      <div className="flex flex-1 gap-12 px-16 py-12">
        {/* Body copy (2/3 width) */}
        <div className="flex-1 min-w-0">
          <p
            data-var="bodyText"
            style={{
              fontSize: "0.9375rem",
              color: "var(--cf-text)",
              lineHeight: 1.7,
              letterSpacing: "-0.01em",
              whiteSpace: "pre-wrap",
            }}
          >
            {vars.bodyText}
          </p>
        </div>

        {/* Callout card (1/3 width) */}
        {(vars.calloutTitle || vars.calloutBody) && (
          <aside
            className="w-56 flex-shrink-0 rounded-card p-6 relative"
            style={{
              background: vars.partnerColor ? `${vars.partnerColor}12` : "var(--cf-bg-300)",
              border: `1px solid ${vars.partnerColor ?? "var(--cf-border)"}30`,
            }}
          >
            {/* Corner brackets */}
            <span
              className="absolute -top-1 -left-1 h-2 w-2 rounded-[1.5px]"
              style={{ border: "1px solid var(--cf-border)", background: "var(--cf-bg-100)"/* template body */ }}
              aria-hidden="true"
            />
            <span
              className="absolute -top-1 -right-1 h-2 w-2 rounded-[1.5px]"
              style={{ border: "1px solid var(--cf-border)", background: "var(--cf-bg-100)"/* template body */ }}
              aria-hidden="true"
            />
            <span
              className="absolute -bottom-1 -left-1 h-2 w-2 rounded-[1.5px]"
              style={{ border: "1px solid var(--cf-border)", background: "var(--cf-bg-100)"/* template body */ }}
              aria-hidden="true"
            />
            <span
              className="absolute -bottom-1 -right-1 h-2 w-2 rounded-[1.5px]"
              style={{ border: "1px solid var(--cf-border)", background: "var(--cf-bg-100)"/* template body */ }}
              aria-hidden="true"
            />

            {vars.calloutTitle && (
              <h6
                data-var="calloutTitle"
                className="mb-3"
                style={{ fontSize: "1rem", fontWeight: 500, color: "var(--cf-text)" }}
              >
                {vars.calloutTitle}
              </h6>
            )}
            {vars.calloutBody && (
              <p
                data-var="calloutBody"
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--cf-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {vars.calloutBody}
              </p>
            )}
          </aside>
        )}
      </div>

      {/* ── CTA strip ─────────────────────────────────────────── */}
      {vars.ctaText && (
        <div
          className="mx-16 mb-8 rounded-card px-8 py-5 flex items-center justify-between"
          style={{
            background: vars.partnerColor ?? "var(--cf-orange)",
            color: "var(--cf-bg-100)",
          }}
        >
          <p
            data-var="ctaText"
            style={{ fontSize: "1rem", fontWeight: 500, letterSpacing: "-0.02em" }}
          >
            {vars.ctaText}
          </p>
          {vars.websiteUrl && (
            <span data-var="websiteUrl" className="font-mono text-sm" style={{ opacity: 0.85 }}>
              {vars.websiteUrl}
            </span>
          )}
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        className="mt-auto flex items-end justify-between px-16 py-8"
        style={{ borderTop: "1px solid var(--cf-border)" }}
      >
        <div className="space-y-1">
          <p
            data-var="partnerName"
            style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--cf-text)" }}
          >
            {vars.partnerName}
          </p>
          {vars.contactEmail && (
            <p
              data-var="contactEmail"
              className="font-mono"
              style={{ fontSize: "0.8125rem", color: "var(--cf-text-muted)" }}
            >
              {vars.contactEmail}
            </p>
          )}
          {vars.contactPhone && (
            <p
              data-var="contactPhone"
              className="font-mono"
              style={{ fontSize: "0.8125rem", color: "var(--cf-text-muted)" }}
            >
              {vars.contactPhone}
            </p>
          )}
        </div>

        <div className="text-right space-y-1">
          <p
            style={{
              fontSize: "0.6875rem",
              color: "var(--cf-text-subtle)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Powered by Cloudflare
          </p>
          <p
            style={{
              fontSize: "0.6875rem",
              color: "var(--cf-text-subtle)",
              fontFamily: "var(--font-mono)",
            }}
          >
            cloudflare.com/partners
          </p>
        </div>
      </footer>
    </article>
  );
}
