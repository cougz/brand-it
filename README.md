# Brand-It

A self-service web tool that lets Cloudflare channel partners produce co-branded marketing assets — one-pagers, solution briefs, email banners — without designer help.

**Status:** Pre-implementation. The MVP build plan is locked. Scaffolding starts in the next session.

---

## Documents

- **[PLAN.md](./PLAN.md)** — Full MVP build plan. Architecture, data model, design system, deployment, six-week schedule. Read this first.
- **[NEXT-STEPS.md](./NEXT-STEPS.md)** — Concrete actions to take in the next coding session. Start here when resuming work.

---

## High-Level Architecture

- **Frontend:** TanStack Start (SSR on Cloudflare Workers), Tailwind v4, custom UI layer matching the `workers.cloudflare.com` aesthetic
- **Backend:** Hono API routes on the same Worker, two Durable Objects (`PartnerSession`, `EditorSession`) via the Agents SDK
- **Storage:** D1 (relational), R2 (assets + exports), KV (caches)
- **AI:** Workers AI only — `@cf/meta/llama-3.3-70b-instruct-fp8-fast` via AI Gateway (`brand-it`)
- **Export:** Separate Worker + Cloudflare Container + Browser Rendering → PDF/PNG
- **Auth:** Cloudflare Access (OTP email)
- **Deploy:** Cloudflare Workers Builds Integration. Push to `main` → live in under a minute.

100% on the Cloudflare Developer Platform. No third-party services in the runtime path.

---

## Repository

- **GitLab:** `https://gitlab.cfdata.org/tim.seiffert/brand-it`
- **Branch policy (MVP phase):** push to `main` directly. Feature branches for previews only.
- **Package manager:** `pnpm`
- **Owner:** Tim Seiffert · tim.seiffert@cloudflare.com

---

## Template Authoring (Dual-Layer)

Every template is two co-located files:

```
templates/<slug>/
├── content.md       ← content layer: text, defaults, field schema (content creators edit this)
├── Template.tsx     ← design layer: layout, alignment, brand application (engineers/AI edit this)
├── brand-vars.ts    ← generated from content.md at build time
├── meta.json
└── thumbnail.png
```

See PLAN.md §7 for the full contract.

In MVP, both layers are hand-authored. Post-MVP, AI generates the `Template.tsx` from a content brief and the `content.md`.
